import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import Roles from '../../constants/roles.js'
import NsfwWarns from '../../database/models/nsfwWarns.js'

export default {
	directory: 'NSFW Moderation',
	usage: '(member) (reason)',
	requirements: 'NSFW Moderator',

	data: new SlashCommandBuilder()
		.setName('nsfw-warn')
		.setDescription('(Modular) Warn System for NSFW Category')
		.addUserOption(user => user
			.setName('user')
			.setDescription('Member to warn')
			.setRequired(true))
		.addStringOption(reason => reason
			.setName('reason')
			.setDescription('Reason for the warn')
			.setRequired(true)),

	/** @param {CommandInteraction} interaction */
	execute: async function (interaction) {
		// Args
		const member = await interaction.guild.members.fetch(interaction.options.getUser('user').id).catch(() => {
			interaction.reply({ content: `Invalid member.` })
		})
		const reason = interaction.options.getString('reason')

		// Execute
		if (!interaction.member.roles.cache.some(r => [
			Roles.admin,
			Roles.nsfwMod,
		].includes(r.id)))
			return interaction.reply(`Insufficient permissions.`)

		NsfwWarns.findOne({ memberID: member.id }, {}, {}, async (err, data) => {
			if (err) throw err
			if (!data) {
				data = new NsfwWarns({
					memberID: member.id,
					warnings: new Map(),
				})
				data.warnings.set(`${data.warnings.size + 1}`, {
					case: data.warnings.size + 1,
					moderatorID: interaction.member.user.id,
					reason,
					date: `<t:${Math.round(interaction.createdTimestamp / 1000)}:R>`,
				})
				data.save()
			} else {
				data.warnings.set(`${data.warnings.size + 1}`,
					{
						case: data.warnings.size + 1,
						moderatorID: interaction.member.user.id,
						reason,
						date: `<t:${Math.round(interaction.createdTimestamp / 1000)}:R>`,
					},
				)
				data.save()
			}

			await member.send({
				content: `You have been warned in the NSFW Section by **${interaction.member.user.tag}**.
				\n**Reason**: ${reason}`,
			}).catch(() => {})
		})
		await interaction.reply(`**${member.user.tag}** has been warned in the NSFW Section.`)
	},
}
