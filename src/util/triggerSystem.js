import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js'
import Triggers from '../database/models/triggers.js'
import Roles from '../constants/roles.js'

export default {
	/** @param {CommandInteraction} interaction */
	add: async function (interaction) {
		const trigger = interaction.options.getString('trigger')
		const isEmbed = interaction.options.getBoolean('embed')
		const response = interaction.options.getString('response')

		if (!interaction.member.roles.cache.some(r => [
			Roles.helper, Roles.mod, Roles.admin,
		].includes(r.id)))
			return interaction.reply(`Insufficient permissions.`)

		if (isEmbed) {
			try {
				const json = JSON.stringify(new MessageEmbed(JSON.parse(response)).toJSON())
				Triggers.findOne({ trigger }, {}, {}, async (err, data) => {
					if (err) throw err
					if (!data) {
						await Triggers.create({
							trigger,
							author: interaction.member.user.id,
							isEmbed,
							json,
							date: `<t:${Math.round(interaction.createdTimestamp / 1000)}:R>`,
						})
						await interaction.reply(`Added \`${trigger}\``)
					} else await interaction.reply(`\`${trigger}\` already exists`)
				})
			} catch (e) {
				await interaction.reply(e.message)
			}
		} else
			Triggers.findOne({ trigger }, {}, {}, async (err, data) => {
				if (err) throw err
				if (!data) {
					await Triggers.create({
						trigger,
						author: interaction.member.user.id,
						isEmbed,
						response: response.replaceAll('\\n', '\n'),
						date: `<t:${Math.round(interaction.createdTimestamp / 1000)}:R>`,
					})
					await interaction.reply(`Added \`${trigger}\``)
				} else await interaction.reply(`\`${trigger}\` already exists`)
			})
	},

	/** @param {CommandInteraction} interaction */
	delete: async function (interaction) {
		const trigger = interaction.options.getString('trigger')

		if (!interaction.member.roles.cache.some(r => [
			Roles.helper, Roles.mod, Roles.admin,
		].includes(r.id)))
			return interaction.reply(`Insufficient permissions.`)

		Triggers.findOne({ trigger }, {}, {}, (err, data) => {
			if (err) throw err
			if (!data)
				return interaction.reply(`\`${trigger}\` does not exist`)
			data.delete()
			interaction.reply(`Deleted \`${trigger}\``)
		})
	},

	/** @param {CommandInteraction} interaction */
	view: async function (interaction) {
		const trigger = interaction.options.getString('trigger')

		if (!interaction.member.roles.cache.some(r => [
			Roles.helper, Roles.mod, Roles.admin,
		].includes(r.id)))
			return interaction.reply(`Insufficient permissions.`)

		Triggers.findOne({ trigger }, {}, {}, async (err, data) => {
			if (err) throw err
			if (!data)
				return interaction.reply(`\`${trigger}\` does not exist`)

			const author = await interaction.guild.members.fetch({ user: data.author }).catch(() => {
			})
			if (data.isEmbed) {
				await interaction.reply({
					embeds: [
						new MessageEmbed({
							author: {
								name: author.user.tag,
								iconURL: author.user.avatarURL({ dynamic: true }),
							},
							color: 'RANDOM',
							title: trigger,
							description: `Since response is an embed, I simulated it as if you triggered it. You can see the response you'll get from this trigger in the embed form below.\n\nJSON Format for curious goats: \`\`\`${JSON.stringify(
								JSON.parse(data.json),
								null,
								4,
							)}\`\`\`\nAdded ${data.date}`,
							timestamp: new Date(),
						}), new MessageEmbed(JSON.parse(data.json)),
					],
				})
			} else await interaction.reply({
				embeds: [
					new MessageEmbed({
						author: {
							name: author.user.tag,
							iconURL: author.user.avatarURL({ dynamic: true }),
						},
						color: 'RANDOM',
						title: trigger,
						description: `**Response**\n${data.response}\n\nAdded ${data.date}`,
						timestamp: new Date(),
					}),
				],
			})
		})
	},

	/** @param {CommandInteraction} interaction */
	list: async function (interaction) {
		Triggers.find(async (err, data) => {
			if (err) throw err
			if (data.length === 0)
				return interaction.reply(`There are no triggers, yet.`)

			await interaction.reply({
				files: [
					new MessageAttachment(Buffer.from(data.map(value => {
						return `# Trigger\n- ${value['trigger']}\n`
					}).sort().join('\n')), 'triggers.md'),
				],
			})
		})
	},
}
