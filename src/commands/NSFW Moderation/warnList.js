import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import Roles from '../../constants/roles.js'
import NsfwWarns from '../../database/models/nsfwWarns.js'

export default {
	directory: 'NSFW Moderation',
	usage: '(member)',
	requirements: 'NSFW Moderator',

	data: new SlashCommandBuilder()
		.setName('nsfw-warn-list')
		.setDescription('(Modular) Warn System for NSFW Category')
		.addUserOption(user => user
			.setName('user')
			.setDescription('Member to warn')
			.setRequired(true)),

	/** @param {CommandInteraction} interaction */
	execute: async function (interaction) {
		const member = await interaction.guild.members.fetch(interaction.options.getUser('user').id)
			.catch(() => {
				interaction.reply(`Invalid member.`)
			})

		if (!interaction.member.roles.cache.some(r => [
			Roles.admin,
			Roles.nsfwMod,
		].includes(r.id)))
			return interaction.reply(`Insufficient permissions.`)

		NsfwWarns.findOne({ memberID: member.id }, {}, {}, async (err, data) => {
			if (err) throw err
			if (data.warnings.size === 0) {
				data.delete()
				return interaction.reply(`**${member.user.tag}** has no warnings.`)
			}

			const fields = []
			for (const value of data.warnings.values()) {
				const moderator = await interaction.guild.members.fetch({ user: value.moderatorID }).catch(() => {
				})
				fields.push({
					name: `Case: ${value.case}`,
					value: `Moderator: ${moderator.user.tag ?? moderator}\nReason: ${value.reason}\nDate: ${value.date}`,
					inline: true,
				})
			}

			await interaction.reply({
				embeds: [
					new MessageEmbed({
						color: 'PURPLE',
						title: `${member.user.tag ?? member}'s NSFW Warn History`,
						description: 'Please clear out redundant warnings as Discord embeds have a limit of 6000 characters, this function may not work in the future with many warnings.',
						fields,
						footer: { text: `ID: ${member.id}` },
						timestamp: new Date(),
					}),
				],
			}).catch(() => {
				interaction.reply('Please ask Zyla for help if present.')
			})
		})
	},
}
