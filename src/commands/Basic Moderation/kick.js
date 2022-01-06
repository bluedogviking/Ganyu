import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageEmbed } from 'discord.js'

export default {
  directory: 'Basic Moderation',
  usage: `@member [reason]`,
  requirements: 'Kick Members',
  perms: 1n << 1n,

  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a member from the server.')
    .addUserOption(member => member
      .setName('member')
      .setDescription('The member to kick')
      .setRequired(true))
    .addStringOption(reason => reason
      .setName('reason')
      .setDescription('Reason for kicking')
      .setRequired(false),
    ),

  /** @param {CommandInteraction} interaction */
  execute: async function (interaction) {
    await interaction.deferReply()
    const user = interaction.options.getUser('member', true).id
    const member = await interaction.guild.members.fetch({ user })
    const reason = interaction.options.getString('reason',
      false,
    ) ?? `No reason provided by ${interaction.member.user.tag}`

    if (user === interaction.member.user.id)
      return interaction.editReply(`Why yes, I'd ${this.data.name} you myself if I had the chance to but yeah, this is not happening.`)
    else if (!member.manageable)
      return interaction.editReply(`I can't ${this.data.name} ${member.user.tag ?? member} due to role hierarchy.`)
    else if (member.roles.highest.position >= interaction.member.roles.highest.position)
      return interaction.editReply(`You can't ${this.data.name} ${member.user.tag ?? member} due to role hierarchy.`)

    await member.send({
      embeds: [
        new MessageEmbed({
          color: 'RED',
          title: `You have been kicked from ${interaction.guild.name}!`,
          description: `Responsible Moderator: ${interaction.member.user.tag ?? interaction.member}-(${interaction.member.user.id})\nReason: ${reason}`,
          timestamp: new Date(),
        }),
      ],
    })
      .catch(() => {})

    interaction.guild.members.kick(member.id, reason)
      .then(kickInfo => {
        interaction.editReply(`Kicked ${kickInfo.tag ?? kickInfo}`)
      })
      .catch((error) => {
        interaction.editReply(`I couldn't ${this.data.name} the user, sorry.\n${error.message}`)
      })
  },
}
