import { SlashCommandBuilder } from '@discordjs/builders'

export default {
	directory: 'Moderation',
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
		const user = interaction.options.getString('id', true)
		const reason = interaction.options.getString('reason',
			false,
		) ?? `No reason provided by ${interaction.member.user.tag}`
		const bans = await interaction.guild.bans.fetch()

		const isBanned = bans.has(user)
		if (!isBanned)
			return interaction.reply(`Invalid ID/is not banned.`)

		interaction.guild.bans.remove(user, reason)
			.then(unbanInfo => {
				interaction.reply(`Unbanned ${unbanInfo.tag ?? unbanInfo}`)
			})
			.catch((error) => {
				interaction.reply(`There was an error unbanning the user.\n${error.message}`)
			})
	},
}
