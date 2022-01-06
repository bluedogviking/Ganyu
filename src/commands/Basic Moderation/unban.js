import { SlashCommandBuilder } from '@discordjs/builders'

export default {
  directory: 'Basic Moderation',
  usage: `id [reason]`,
  requirements: 'Ban Members',
  perms: 1n << 2n,

  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unbans a user from the server.')
    .addStringOption(user => user
      .setName('id')
      .setDescription('The user to unban')
      .setRequired(true),
    )
    .addStringOption(reason => reason
      .setName('reason')
      .setDescription('Reason for unbanning user')
      .setRequired(false),
    ),

  execute: async function (interaction) {
    await interaction.deferReply()

    const user = interaction.options.getString('id', true)
    const reason = interaction.options.getString('reason',
      false,
    ) ?? `No reason provided by ${interaction.member.user.tag}`
    const bans = await interaction.guild.bans.fetch()

    const isBanned = bans.has(user)
    if (!isBanned)
      return interaction.editReply(`Invalid ID/is not banned.`)

    interaction.guild.bans.remove(user, reason)
      .then(unbanInfo => {
        interaction.editReply(`Unbanned ${unbanInfo.tag ?? unbanInfo}`)
      })
      .catch((error) => {
        interaction.editReply(`I couldn't ${this.data.name} the user, sorry.\n${error.message}`)
      })
  },
}
