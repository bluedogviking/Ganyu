import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageEmbed } from 'discord.js'

export default {
	directory: 'Basic Moderation',
	usage: `id [reason]`,
	requirements: 'Ban Members',
	perms: 1n << 2n,

	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans a user from the server.')
		.addStringOption(id => id
			.setName('id')
			.setDescription('The user to ban')
			.setRequired(true))
		.addStringOption(reason => reason
			.setName('reason')
			.setDescription('The reason for the ban'),
		),

	/** @param {CommandInteraction} interaction */
	execute: async function (interaction) {
		const user = interaction.options.getString('id')
		const isMember = interaction.guild.members.cache.get(user)
		let days = 7
		const reason = interaction.options.getString(
			'reason', false) ?? `No reason provided by ${interaction.member.user.tag}`

		// if TDA
		if (interaction.member.user.id === '383292260298784768') {
			await interaction.guild.members.ban(isMember, { days, reason })
			return interaction.reply({
				embeds: [
					{
						color: 'RED',
						description: `The Qixing Emissary has descended upon ${isMember.user.tag ?? isMember} to banish them for good, now you shall perish. <:KleeFU_GM:790780255984025610>`,
						image: { url: 'https://live.staticflickr.com/65535/52332621723_2ca15a645b_o.gif' },
						footer: `ID: ${isMember.id}`,
					},
				],
			})
		}

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
		else if (isMember.roles.highest.position >= interaction.member.roles.highest.position)
			return interaction.reply(
				`You can't ${this.data.name} ${isMember.user.tag ?? isMember} due to role hierarchy.`)

		await isMember.send({
				embeds: [
					new MessageEmbed({
						color: 'RED',
						title: `You have been banned from ${interaction.guild.name}!`,
						description: `Responsible Moderator: ${interaction.member.user.tag ?? interaction.member}-(${interaction.member.user.id})\nReason: ${reason}`,
						timestamp: new Date(),
					}),
				],
			})
			.catch(() => {
			})

		interaction.guild.members.ban(isMember.id, { days, reason })
			.then(banInfo => {
				interaction.reply(`${banInfo.tag ?? banInfo} has been banned.`)
			})
			.catch((error) => {
				interaction.reply(`There was an error banning the member.\n${error.message}`)
			})
	},
}
