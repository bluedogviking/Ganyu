import { CommandInteraction } from 'discord.js'

import { SlashCommandBuilder } from '@discordjs/builders'

export default {
	directory: 'Server',
	usage: `member`,
	requirements: 'Administrator',
	perms: ['ADMINISTRATOR'],

	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Assign/remove the Birthday role from a member.')
		.addUserOption(user => user
			.setName('member')
			.setDescription('Member to add/remove the role from')
			.setRequired(true),
		),

	/** @param {CommandInteraction} interaction */
	execute: async function (interaction) {
		const user = interaction.options.getUser('member').id
		const member = await interaction.guild.members.fetch({ user })
			.catch(() => {
				interaction.reply(`Invalid member.`)
			})

		//                                         birthday role
		await interaction.guild.roles.fetch('999807700932235405')
			.then(async (role) => {
				if (member.roles.cache.has(role.id)) {
					await member.roles.remove(role)
					await interaction.reply({
						content: `Birthday role has been removed from **${member.user.tag}**.`,
					})
				} else {
					await member.roles.add(role)
					await interaction.reply({
						content: `Birthday role has been added to **${member.user.tag}**.`,
					})
				}
			}).catch(() => {})
	},
}
