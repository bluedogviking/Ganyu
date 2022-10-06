import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import Roles from '../../constants/roles.js'
import NsfwMutes from '../../database/models/nsfwMutes.js'

export default {
	directory: 'NSFW Moderation',
	usage: `(member)`,
	requirements: 'Mute Members & Manage Roles',
	perms: 1n << 22n | 1n << 28n,

	data: new SlashCommandBuilder()
		.setName('nsfw-unmute')
		.setDescription('Unmutes a member in the NSFW Section.')
		.addUserOption(user => user
			.setName('member')
			.setDescription('Member to unmute')
			.setRequired(true)),

	/** @param {CommandInteraction} interaction */
	execute: async function (interaction) {
		const member = await interaction.guild.members.fetch(interaction.options.getUser('member').id)
			.catch(() => {
				interaction.reply(`Invalid member.`)
			})

		const muted = await interaction.guild.roles.cache.get(Roles.nsfwMuted)

		member.roles.remove(muted)
			.then(member => {
				interaction.reply(`${member.user.tag ?? member} has been unmuted in the NSFW Section.`)
			})


		await member.send({ content: `You have been unmuted in the NSFW Section by **${interaction.member.user.tag}**.` })
			.catch(() => {})

		NsfwMutes.findOne({ memberID: member.id }, {}, {}, async (err, data) => {
			if (err) throw err
			if (!data) return
			data.delete()
		})
	},
}
