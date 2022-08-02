import NSFWWarns from '../database/models/nsfwWarns.js'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import Roles from '../constants/roles.js'

export default {
	/** @param {CommandInteraction} interaction */
	add: async function (interaction) {
		const user = interaction.options.getUser('member').id
		const member = await interaction.guild.members.fetch({ user })
			.catch((e) => {
				interaction.reply(`There was an error finding the member.\nError message: ${e.message}`)
			})
		const reason = interaction.options.getString('reason')

		if (!interaction.member.roles.cache.has(Roles.nsfwModerator) && !interaction.memberPermissions.has('MANAGE_ROLES'))
			return await interaction.reply('Insufficient permissions.')
		if (user === interaction.member.user.id)
			return interaction.reply(
				`You can't NSFW warn yourself.`)
		else if (!member.manageable)
			return interaction.reply(`I can't warn ${member.user.tag ?? member} due to role hierarchy.`)
		else if (member.roles.highest.position >= interaction.member.roles.highest.position)
			return interaction.reply(`You can't warn ${member.user.tag ?? member} due to role hierarchy.`)

		NSFWWarns.findOne({ memberID: member.id }, {}, {}, async (err, data) => {
			if (err) throw err
			if (!data) {
				data = new NSFWWarns({
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
						title: `You have been warned in the NSFW Section of ${interaction.guild.name}`,
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
			.catch((e) => {interaction.reply(`There was an error finding the member.\nError message: ${e.message}`)})
		const caseNum = interaction.options.getNumber('case-number')

		if (!interaction.member.roles.cache.has(Roles.nsfwModerator) && !interaction.memberPermissions.has('MANAGE_ROLES'))
			return await interaction.reply('Insufficient permissions.')

		if (user === interaction.member.user.id)
			return interaction.reply(
				`You can't remove your own NSFW warning.`)
		else if (!member.manageable)
			return interaction.reply(`I can't remove ${member.user.tag ?? member}'s NSFW warn due to role hierarchy.`)
		else if (member.roles.highest.position >= interaction.member.roles.highest.position)
			return interaction.reply(`You can't remove ${member.user.tag ?? member}'s NSFW warn due to role hierarchy.`)

		NSFWWarns.findOne({ memberID: member.id }, {}, {}, async (err, data) => {
			if (err) throw err
			if (!data)
				return interaction.reply(`${member.user.tag ?? member} has no NSFW warnings.`)
			else if (!data.warnings.has(`${caseNum}`))
				return interaction.reply(`I couldn't find the specified NSFW warning.`)
			data.warnings.delete(`${caseNum}`)
			data.save()
			await interaction.reply(`Removed the NSFW warn: ${caseNum} from ${member.user.tag ?? member}.`)
		})
	},

	/** @param {CommandInteraction} interaction */
	clear: async function (interaction) {
		const user = interaction.options.getUser('member').id
		const member = await interaction.guild.members.fetch({ user })
			.catch((e) => {
				interaction.reply(`There was an error finding the member.\nError message: ${e.message}`)
			})

		if (!interaction.member.roles.cache.has(Roles.nsfwModerator) && !interaction.memberPermissions.has('MANAGE_ROLES'))
			return await interaction.reply('Insufficient permissions.')

		if (user === interaction.member.user.id)
			return interaction.reply(
				`You can't clear your own NSFW warnings.`)
		else if (!member.manageable)
			return interaction.reply(`I can't clear ${member.user.tag ?? member}'s NSFW warnings due to role hierarchy.`)
		else if (member.roles.highest.position >= interaction.member.roles.highest.position)
			return interaction.reply(`You can't clear ${member.user.tag ?? member}'s NSFW warnings due to role hierarchy.`)

		NSFWWarns.findOne({ memberID: member.id }, {}, {}, (err, data) => {
			if (err) throw err
			if (!data)
				return interaction.reply(`${member.user.tag ?? member} has no NSFW warnings.`)

			data.delete()
			member.send({
				embeds: [
					new MessageEmbed({
						color: 'GREEN',
						title: 'Your NSFW Warn History has been cleared!',
						description: `Responsible Moderator: ${interaction.member.user.tag ?? interaction.member}-(${interaction.member.user.id})`,
						timestamp: new Date()
					})
				]
			})
			interaction.reply(`${member.user.tag ?? member}'s NSFW Warn History has been cleared.`)
		})
	},

	/** @param {CommandInteraction} interaction */
	view: async function (interaction) {
		const user = interaction.options.getUser('member').id
		const member = await interaction.guild.members.fetch({ user })
			.catch((e) => {interaction.reply(`There was an error finding the member.\nError message: ${e.message}`)})

		if (!interaction.member.roles.cache.has(Roles.nsfwModerator) && !interaction.memberPermissions.has('MANAGE_ROLES'))
			return await interaction.reply('Insufficient permissions.')

		NSFWWarns.findOne({ memberID: user }, {}, {}, async (err, data) => {
			if (err) throw err
			if (!data)
				return await interaction.reply(`${member.user.tag ?? member} has no warnings.`)

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
						color: 'RANDOM',
						title: `${member.user.tag ?? member}'s NSFW Warn History`,
						description: 'Please clear out redundant warnings as Discord embeds have a limit of 6000 characters, this function may not work in the future with many warnings.',
						fields,
						footer: { text: `ID: ${member.id}` },
						timestamp: new Date()
					})
				]
			})
		})
	}
}
