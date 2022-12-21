import { CommandInteraction } from 'discord.js'

import { SlashCommandBuilder } from '@discordjs/builders'

export default {
	directory: 'Moderation',
	usage: `pfp (link)`,
	requirements: 'ADMINISTRATION',
	perms: ['ADMINISTRATOR'],

	data: new SlashCommandBuilder()
		.setName('pfp')
		.setDescription('Change Ganyu\'s pfp.')
		.addStringOption(link => link
			.setName('link')
			.setDescription('New profile picture link')
			.setRequired(true)),

	/** @param {CommandInteraction} interaction */
	execute: async function (interaction) {
		const link = interaction.options.getString('link').trim()
		await interaction.client.user.setAvatar(link).then(async () => {
				await interaction.reply({ content: `Profile picture successfully changed.` })
			})
			.catch(err => {interaction.reply({ content: `There was an error changing the profile picture.\n${err.message}` })})
	},
}
