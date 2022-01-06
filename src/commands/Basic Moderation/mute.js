import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import ms from 'ms'
import prettyMilliseconds from 'pretty-ms'
import Mutes from '../../database/models/mutes.js'
import Roles from '../../constants/roles.js'

export default {
  directory: 'Basic Moderation',
  usage: `@member id [duration] [reason]`,
  requirements: 'Mute Members & Manage Roles',
  perms: 1n << 22n | 1n << 28n,

  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mutes a member in the server.')
    .addSubcommand(member => member
      .setName('member')
      .setDescription('Member to mute')
      .addUserOption(member => member
        .setName('member')
        .setDescription('Member to mute')
        .setRequired(true))
      .addStringOption(duration => duration
        .setName('duration')
        .setDescription('Duration for the mute (indefinite by default)')
        .setRequired(false))
      .addStringOption(reason => reason
        .setName('reason')
        .setDescription('Reason for the mute')
        .setRequired(false))),

  /** @param {CommandInteraction} interaction */
  execute: async function (interaction) {
    await interaction.deferReply()

    const user = interaction.options.getUser('member').id
    const member = await interaction.guild.members.fetch({ user })
      .catch(() => {})
    const duration = interaction.options.getString('duration')
    let reason = interaction.options.getString('reason') ?? `No reason provided by ${interaction.member.user.tag}`

    const muteRole = await interaction.guild.roles.fetch(Roles.muteRole, { cache: false })
      .catch(() => {})

    if (user === interaction.member.user.id)
      return interaction.editReply(
        `Why yes, I'd ${this.data.name} you myself if I had the chance to but yeah, this is not happening.`)
    else if (!member.manageable)
      return interaction.editReply(`I can't ${this.data.name} ${member.user.tag ?? member} due to role hierarchy.`)
    else if (member.roles.highest.position >= interaction.member.roles.highest.position)
      return interaction.editReply(`You can't ${this.data.name} ${member.user.tag ?? member} due to role hierarchy.`)

    if (!duration) {
      member.roles.add(muteRole, reason)
        .then(member => {
          interaction.editReply(`Muted ${member.user.tag ?? member} indefinitely.`)
        })
        .catch(error => {
          interaction.editReply(`There was an error muting the member.\n${error.message}`)
        })
    } else {
      member.roles.add(muteRole, reason)
        .then(member => {
          interaction.editReply(
            `Muted ${member.user.tag ?? member} for ${prettyMilliseconds(ms(duration), { verbose: true })}.`)
        })
        .catch(error => {
          interaction.editReply(`There was an error muting the member.\n${error.message}`)
        })
    }

    await member.send({
      embeds: [
        new MessageEmbed({
          color: 'RED',
          title: `You have been muted in ${interaction.guild.name}!`,
          description: `Responsible Moderator: ${interaction.member.user.tag ?? interaction.member}-(${interaction.member.user.id})\nReason: ${reason}\nDuration: ${duration ? prettyMilliseconds(
            ms(duration), { verbose: true }) : 'Permanently'}`,
          timestamp: new Date(),
        }),
      ],
    })
      .catch(() => {})

    Mutes.findOne({ memberID: member.id }, {}, {}, async (err, data) => {
      if (err) throw err
      if (!data) {
        await Mutes.create({
          memberID: member.id,
          unmuteAt: duration ? Date.now() + ms(duration) : Infinity,
        })
      } else {
        data.unmuteAt = duration ? Date.now() + ms(duration) : Infinity
        data.save()
      }
    })
  },
}
