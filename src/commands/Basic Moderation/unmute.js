import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import mutes from '../../database/models/mutes.js'
import Roles from '../../constants/roles.js'

export default {
	directory: 'Basic Moderation',
	usage: `member id`,
	requirements: 'Mute Members & Manage Roles',
	perms: 1n << 22n | 1n << 28n,

	data: new SlashCommandBuilder()
		.setName('unmute')
		.setDescription('Unmutes a member in the server.')
		.addSubcommand(member => member
			.setName('member')
			.setDescription('Unmutes a member in the server.')
			.addUserOption(member => member
				.setName('member')
				.setDescription('Member to unmute')
				.setRequired(true))),

	/** @param {CommandInteraction} interaction */
	execute: async function (interaction) {
		const user = interaction.options.getUser('member').id
		const member = await interaction.guild.members.fetch({ user })
			.catch(() => {
				interaction.reply(`Invalid member.`)
			})

		const muteRole = await interaction.guild.roles.fetch(Roles.muted, { cache: false })
			.catch(() => {
			})

		if (user === interaction.member.user.id)
			return interaction.reply(`You can't unmute yourself.`)
		else if (member.roles.highest.position >= interaction.member.roles.highest.position)
			return interaction.reply(`You can't ${this.data.name} ${member.user.tag ?? member} due to role hierarchy.`)

		member.roles.remove(muteRole)
			.then(member => {
				interaction.reply(`Unmuted ${member.user.tag ?? member}.`)
			})
			.catch(() => {
				interaction.reply(`Invalid member.`)
			})

		await member.send({
				embeds: [
					new MessageEmbed({
						color: 'RED',
						title: `You have been unmuted in ${interaction.guild.name}!`,
						description: `Responsible Moderator: ${interaction.member.user.tag ?? interaction.member}-(${interaction.member.user.id})`,
						timestamp: new Date(),
					}),
				],
			})
			.catch(() => {
			})

		mutes.findOne({ member_id: member.id }, {}, {}, async (err, data) => {
			if (err) throw err
			if (!data) return
			data.delete()
		})
	},
}
