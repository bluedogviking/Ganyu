import Warns from '../database/models/warns.js'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import Roles from '../constants/roles.js'

export default {
	/** @param {CommandInteraction} interaction */
	add: async function (interaction) {
		const user = interaction.options.getUser('member').id
		const member = await interaction.guild.members.fetch({ user })
			.catch(() => {
				interaction.reply(`Invalid member.`)
			})
		const reason = interaction.options.getString('reason')

		if (!interaction.member.roles.cache.some(r => [
			Roles.admin,
			Roles.mod
		].includes(r.id)))
			return interaction.reply(`Insufficient permissions.`)

		if (user === interaction.member.user.id)
			return interaction.reply(
				`You can't ${interaction.commandName} yourself.`)
		else if (member.roles.highest.position >= interaction.member.roles.highest.position)
			return interaction.reply(`You can't warn ${member.user.tag ?? member} due to role hierarchy.`)

		Warns.findOne({ memberID: member.id }, {}, {}, async (err, data) => {
			if (err) throw err
			if (!data) {
				data = new Warns({
					memberID: member.id,
					warnings: new Map()
				})
				data.warnings.set(`${data.warnings.size + 1}`, {
					case: data.warnings.size + 1,
					moderatorID: interaction.member.user.id,
					reason,
					date: `<t:${Math.round(interaction.createdTimestamp / 1000)}:R>`
				})
				data.save()
			} else {
				data.warnings.set(`${data.warnings.size + 1}`,
					{
						case: data.warnings.size + 1,
						moderatorID: interaction.member.user.id,
						reason,
						date: `<t:${Math.round(interaction.createdTimestamp / 1000)}:R>`
					}
				)
				data.save()
			}

			await member.send({
				embeds: [
					new MessageEmbed({
						color: 'RED',
						title: `You have been warned in ${interaction.guild.name}`,
						description: `Responsible Moderator: ${interaction.member.user.tag ?? interaction.member}-(${interaction.member.user.id})\nReason: ${reason}`,
						timestamp: new Date()
					})
				]
			}).catch(() => {})
		})
		await interaction.reply(`${member.user.tag ?? member} has been warned.`)
	},

	/** @param {CommandInteraction} interaction */
	remove: async function (interaction) {
		const user = interaction.options.getUser('member').id
		const member = await interaction.guild.members.fetch({ user })
			.catch(() => {
				interaction.reply(`Invalid member.`)
			})
		const caseNum = interaction.options.getNumber('case-number')

		if (!interaction.member.roles.cache.some(r => [
			Roles.admin,
			Roles.mod
		].includes(r.id)))
			return interaction.reply(`Insufficient permissions.`)

		if (user === interaction.member.user.id)
			return interaction.reply(
				`You can't remove your own warning.`)
		else if (member.roles.highest.position >= interaction.member.roles.highest.position)
			return interaction.reply(`You can't ${interaction.commandName} ${member.user.tag ?? member} due to role hierarchy.`)

		Warns.findOne({ memberID: member.id }, {}, {}, async (err, data) => {
			if (err) throw err
			if (!data)
				return interaction.reply(`${member.user.tag ?? member} has no warnings.`)
			else if (!data.warnings.has(`${caseNum}`))
				return interaction.reply(`I couldn't find the specified warning.`)
			data.warnings.delete(`${caseNum}`)
			data.save()
			await interaction.reply(`Removed the warn: ${caseNum} from ${member.user.tag ?? member}.`)
		})
	},

	/** @param {CommandInteraction} interaction */
	clear: async function (interaction) {
		const user = interaction.options.getUser('member').id
		const member = await interaction.guild.members.fetch({ user })
			.catch(() => {
				interaction.reply(`Invalid member.`)
			})

		if (!interaction.member.roles.cache.some(r => [
			Roles.admin, Roles.mod
		].includes(r.id)))
			return interaction.reply(`Insufficient permissions.`)

		if (user === interaction.member.user.id)
			return interaction.reply(`You can't clear your own warnings.`)
		else if (member.roles.highest.position >= interaction.member.roles.highest.position)
			return interaction.reply(`You can't ${interaction.commandName} ${member.user.tag ?? member} due to role hierarchy.`)

		Warns.findOne({ memberID: member.id }, {}, {}, (err, data) => {
			if (err) throw err
			if (!data)
				return interaction.reply(`${member.user.tag ?? member} has no warnings.`)

			data.delete()
			member.send({
				embeds: [
					new MessageEmbed({
						color: 'GREEN',
						title: 'Your Warn History has been cleared!',
						description: `Responsible Moderator: ${interaction.member.user.tag ?? interaction.member}-(${interaction.member.user.id})`,
						timestamp: new Date()
					})
				]
			})
			interaction.reply(`${member.user.tag ?? member}'s warn history has been cleared.`)
		})
	},

	/** @param {CommandInteraction} interaction */
	view: async function (interaction) {
		const user = interaction.options.getUser('member').id
		const member = await interaction.guild.members.fetch({ user })
			.catch(() => {
				interaction.reply(`Invalid member.`)
			})

		if (!interaction.member.roles.cache.some(r => [
			Roles.admin, Roles.mod
		].includes(r.id)))
			return interaction.reply(`Insufficient permissions.`)

		Warns.findOne({ memberID: user }, {}, {}, async (err, data) => {
			if (err) throw err
			if (!data)
				return interaction.reply(`${member.user.tag ?? member} has no warnings.`)

			const fields = []
			for (const value of data.warnings.values()) {
				const moderator = await interaction.guild.members.fetch({ user: value.moderatorID }).catch(() => {})
				fields.push({
					name: `Case: ${value.case}`,
					value: `Moderator: ${moderator.user.tag ?? moderator}\nReason: ${value.reason}\nDate: ${value.date}`,
					inline: true
				})
			}

			await interaction.reply({
				embeds: [
					new MessageEmbed({
						color: 'PURPLE',
						title: `${member.user.tag ?? member}'s Warn History`,
						description: 'Please clear out redundant warnings as Discord embeds have a limit of 6000 characters, this function may not work in the future with many warnings.',
						fields,
						footer: { text: `ID: ${member.id}` },
						timestamp: new Date()
					})
				]
			}).catch(() => {
				interaction.reply('Please ask Zyla for help.')
			})
		})
	}
}
