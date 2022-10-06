import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import Roles from '../../constants/roles.js'

export default {
	directory: 'NSFW Moderation',
	usage: `(member) [reason]`,
	requirements: 'Manage Roles',
	perms: ['MANAGE_ROLES'],

	data: new SlashCommandBuilder()
		.setName('restrict')
		.setDescription('Restricts a user from the NSFW Section.')
		.addUserOption(user => user
			.setName('member')
			.setDescription('Member to restrict')
			.setRequired(true))
		.addStringOption(reason => reason
			.setName('reason')
			.setDescription('Reason for restriction')),

	/** @param {CommandInteraction} interaction */
	execute: async function (interaction) {
		// Args
		const member = await interaction.guild.members.fetch(interaction.options.getUser('member').id)
			.catch(() => {
				interaction.reply({ content: `Invalid member.` })
			})
		const reason = interaction.options.getString('reason') ?? 'N/A'

		// Execute
		await member.roles.remove(Roles.nsfwAccess).then(async (member) => {
			await member.roles.add(Roles.nsfwBanned)
		})

		await interaction.reply({ content: `**${member.user.tag}** has been restricted from NSFW Section.` })
		await member.send({
			content: `You have been restricted from the NSFW Section by **${interaction.member.user.tag}**.
			\n**Reason**: ${reason}`,
		}).catch(() => {})
	},
}
