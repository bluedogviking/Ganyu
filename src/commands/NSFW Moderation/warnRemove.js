import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import Roles from '../../constants/roles.js'
import NsfwWarns from '../../database/models/nsfwWarns.js'

export default {
	directory: 'NSFW Moderation',
	usage: '(member) (case-number)',
	requirements: 'NSFW Moderator',

	data: new SlashCommandBuilder()
		.setName('nsfw-warn-remove')
		.setDescription('(Modular) Warn System for NSFW Category')
		.addUserOption(user => user
			.setName('user')
			.setDescription('Member to remove warn of')
			.setRequired(true))
		.addNumberOption(caseNum => caseNum
			.setName('case-number')
			.setDescription('Which case is being removed')
			.setRequired(true)),

	/** @param {CommandInteraction} interaction */
	execute: async function (interaction) {
		// Args
		const member = await interaction.guild.members.fetch(interaction.options.getUser('user').id)
			.catch(() => {
				interaction.reply(`Invalid member.`)
			})
		const caseNum = interaction.options.getNumber('case-number')

		if (!interaction.member.roles.cache.some(r => [
			Roles.admin,
			Roles.nsfwMod,
		].includes(r.id)))
			return interaction.reply(`Insufficient permissions.`)

		NsfwWarns.findOne({ memberID: member.id }, {}, {}, async (err, data) => {
			if (err) throw err
			if (!data)
				return interaction.reply(`**${member.user.tag}** has no warnings.`)
			else if (!data.warnings.has(`${caseNum}`))
				return interaction.reply(`I couldn't find the specified warning.`)
			data.warnings.delete(`${caseNum}`)
			if (data.warnings.size > 0) {
				data.save()
				await interaction.reply(`Removed the case: **${caseNum}** from **${member.user.tag}**'s warn history.`)
			} else {
				data.delete()
				await interaction.reply(`Removing the case left them with no warnings, I deleted their database entry.`)
			}
		})
	},
}
