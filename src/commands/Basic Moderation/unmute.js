import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import mutes from '../../database/models/mutes.js'
import Roles from '../../constants/roles.js'

export default {
  directory: 'Basic Moderation',
  usage: `@member id [reason]`,
  requirements: 'Mute Members & Manage Roles',
  perms: 1n << 22n | 1n << 28n,

  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmutes a member in the server.')
    .addSubcommand(member => member
      .setName('member')
      .setDescription('Unmutes a member in the server.')
      .addUserOption(member => member
        .setName('member')
        .setDescription('Member to unmute')
        .setRequired(true))
      .addStringOption(reason => reason
        .setName('reason')
        .setDescription('Reason for the unmute')
        .setRequired(false))),

  /** @param {CommandInteraction} interaction */
  execute: async function (interaction) {
    const user = interaction.options.getUser('member').id
    const member = await interaction.guild.members.fetch({ user })
      .catch((e) => {
        interaction.reply(`There was an error finding the member.\nError message: ${e.message}`)
      })
    let reason = interaction.options.getString('reason') ?? `No reason provided by ${interaction.member.user.tag}`

    const muteRole = await interaction.guild.roles.fetch(Roles.muteRole, { cache: false })
      .catch((e) => {
        interaction.reply(`There was an error finding the mute role.\nError message: ${e.message}`)
      })

    if (user === interaction.member.user.id)
      return interaction.reply(`You can't unmute yourself.`)
    else if (!member.manageable)
      return interaction.reply(`I can't ${this.data.name} ${member.user.tag ?? member} due to role hierarchy.`)
    else if (member.roles.highest.position >= interaction.member.roles.highest.position)
      return interaction.reply(`You can't ${this.data.name} ${member.user.tag ?? member} due to role hierarchy.`)

    member.roles.remove(muteRole, reason)
      .then(member => {
        interaction.reply(`Unmuted ${member.user.tag ?? member}.`)
      })
      .catch(error => {
        interaction.reply(`There was an error unmuting the member.\n${error.message}`)
      })

    await member.send({
      embeds: [
        new MessageEmbed({
          color: 'RED',
          title: `You have been unmuted in ${interaction.guild.name}!`,
          description: `Responsible Moderator: ${interaction.member.user.tag ?? interaction.member}-(${interaction.member.user.id})\nReason: ${reason}`,
          timestamp: new Date(),
        }),
      ],
    })
      .catch(() => {})

    mutes.findOne({ member_id: member.id }, {}, {}, async (err, data) => {
      if (err) throw err
      if (!data) return
      data.delete()
    })
  },
}
