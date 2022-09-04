import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageEmbed } from 'discord.js'

export default {
	directory: 'Basic Moderation',
	usage: `by-id id [reason]`,
	requirements: 'Ban Members',
	perms: 1n << 2n,

	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans a user from the server.')
		.addSubcommand(id_ban => id_ban
			.setName('by-id')
			.setDescription('Bans a user from the server by their id.')
			.addStringOption(id => id
				.setName('id')
				.setDescription('The user to ban')
				.setRequired(true))
			.addStringOption(reason => reason
				.setName('reason')
				.setDescription('The reason for the ban')
				.setRequired(false)
			)
			.addNumberOption(days => days
				.setName('days')
				.setDescription('Number of days of messages to delete, must be between 0 and 7, inclusive')
				.setRequired(false))
		),

	/** @param {CommandInteraction} interaction */
	execute: async function (interaction) {
		const user = interaction.options.getString('id', true)
		const isMember = await interaction.guild.members.fetch({ user })
			.catch((e) => {
				interaction.reply(`There was an error finding the member.\nError message: ${e.message}`)
			})
		let days = interaction.options.getNumber('days', false)
		days > 7 ? days = 7 : days
		const reason = interaction.options.getString(
			'reason', false) ?? `No reason provided by ${interaction.member.user.tag}`

		if (!isMember)
			return interaction.guild.members.ban(user, { days, reason })
				.then(banInfo => {
					interaction.reply(`Banned ${banInfo.tag ?? banInfo}`)
				})
				.catch((error) => {
					interaction.reply('There was an error banning the member.\n' + error.message)
				})

		if (user === interaction.member.user.id)
			return interaction.reply(
				`You can't ban yourself.`)
		else if (!isMember.manageable)
			return interaction.reply(`I can't ${this.data.name} ${isMember.user.tag ?? isMember} due to role hierarchy.`)
		else if (isMember.roles.highest.position >= interaction.member.roles.highest.position)
			return interaction.reply(
				`You can't ${this.data.name} ${isMember.user.tag ?? isMember} due to role hierarchy.`)

		await isMember.send({
			embeds: [
				new MessageEmbed({
					color: 'RED',
					title: `You have been banned from ${interaction.guild.name}!`,
					description: `Responsible Moderator: ${interaction.member.user.tag ?? interaction.member}-(${interaction.member.user.id})\nReason: ${reason}`,
					timestamp: new Date()
				})
			]
		})
			.catch(() => {})

		interaction.guild.members.ban(isMember.id, { days, reason })
			.then(banInfo => {
				interaction.reply(`${banInfo.tag ?? banInfo} has been banned.`)
			})
			.catch((error) => {
				interaction.reply(`There was an error banning the member.\n${error.message}`)
			})

		if (interaction.member.user.id === '383292260298784768')
			return interaction.reply({ content: `https://i.imgur.com/VTsrV2Q.gif` })
	}
}
