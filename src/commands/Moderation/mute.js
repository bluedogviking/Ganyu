import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import ms from 'ms'
import prettyMilliseconds from 'pretty-ms'
import Mutes from '../../database/models/mutes.js'
import Roles from '../../constants/roles.js'

export default {
	directory: 'Moderation',
	usage: `member id [duration] [reason]`,
	requirements: 'Mute Members & Manage Roles',
	perms: 1n << 22n | 1n << 28n,

	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Mutes a member in the server.')
		.addSubcommand(member => member
			.setName('member')
			.setDescription('Member to mute')
			.addUserOption(member => member
				.setName('member')
				.setDescription('Member to mute')
				.setRequired(true))
			.addStringOption(duration => duration
				.setName('duration')
				.setDescription('Duration for the mute (indefinite by default)'))
			.addStringOption(reason => reason
				.setName('reason')
				.setDescription('Reason for the mute'))),

	/** @param {CommandInteraction} interaction */
	execute: async function (interaction) {
		const user = interaction.options.getUser('member').id
		const member = await interaction.guild.members.fetch({ user })
			.catch(() => {
				interaction.reply(`Invalid member.`)
			})
		const duration = interaction.options.getString('duration')
		let reason = interaction.options.getString('reason') ?? `No reason provided by ${interaction.member.user.tag}`

		const muteRole = await interaction.guild.roles.fetch(Roles.muted, { cache: false })
			.catch(() => {
			})

		if (user === interaction.member.user.id) return interaction.reply(`You can't mute yourself.`)
		else if (member.roles.highest.position >= interaction.member.roles.highest.position) return interaction.reply(`You can't mute ${member.user.tag ?? member} due to role hierarchy.`)

		if (!duration) {
			member.roles.add(muteRole, reason)
				.then(member => {
					interaction.reply(`${member.user.tag ?? member} has been muted indefinitely.`)
				})
				.catch(() => {
				})
		} else {
			member.roles.add(muteRole, reason)
				.then(member => {
					interaction.reply(`${member.user.tag ?? member} has been muted for ${prettyMilliseconds(ms(duration), { verbose: true })}.`)
				})
				.catch(() => {
				})
		}

		await member.send({
				embeds: [new MessageEmbed({
					color: 'RED',
					title: `You have been muted in ${interaction.guild.name}!`,
					description: `Responsible Moderator: ${interaction.member.user.tag ?? interaction.member}-(${interaction.member.user.id})\nReason: ${reason}\nDuration: ${duration ? prettyMilliseconds(ms(duration), { verbose: true }) : 'Permanently'}`,
					timestamp: new Date(),
				})],
			})
			.catch(() => {
			})

		Mutes.findOne({ memberID: member.id }, {}, {}, async (err, data) => {
			if (err) throw err
			if (!data) {
				await Mutes.create({
					memberID: member.id, unmuteAt: duration ? Date.now() + ms(duration) : Infinity,
				})
			} else {
				data.unmuteAt = duration ? Date.now() + ms(duration) : Infinity
				data.save()
			}
		})
	},
}
