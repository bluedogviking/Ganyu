import { CommandInteraction } from 'discord.js'

import { SlashCommandBuilder } from '@discordjs/builders'

export default {
	directory: 'Admin',
	usage: `channel message`,
	requirements: 'Manage Messages',
	perms: 1n << 13n,

	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Bot repeats your message in a given channel or in the same channel.')
		.addStringOption(msg => msg
			.setName('message')
			.setDescription('What do you want me to say?')
			.setRequired(true),
		)
		.addChannelOption(ch => ch
			.setName('channel')
			.setDescription('Which channel do you want me to send the message to?')
			.setRequired(true),
		),

	/** @param {CommandInteraction} interaction */
	execute: async function (interaction) {
		const ch = interaction.options.getChannel('channel')
		const channel = await interaction.guild.channels.fetch(ch.id)
			.catch(() => {
				interaction.reply(`Invalid channel.`)
			})
		const msg = interaction.options.getString('message')

		channel.send(msg).then(async () => {
			await interaction.reply({ ephemeral: true, content: 'Message sent!' })
		})
	},
}
