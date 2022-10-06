import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import ms from 'ms'
import prettyMilliseconds from 'pretty-ms'
import Roles from '../../constants/roles.js'
import NsfwMutes from '../../database/models/nsfwMutes.js'

export default {
	directory: 'NSFW Moderation',
	usage: `(member) [duration] [reason]`,
	requirements: 'Mute Members & Manage Roles',
	perms: 1n << 22n | 1n << 28n,

	data: new SlashCommandBuilder()
		.setName('nsfw-mute')
		.setDescription('Mutes a member in the NSFW Section.')
		.addUserOption(user => user
			.setName('member')
			.setDescription('Member to mute')
			.setRequired(true))
		.addStringOption(duration => duration
			.setName('duration')
			.setDescription('Duration for the mute (a day by default)'))
		.addStringOption(reason => reason
			.setName('reason')
			.setDescription('Reason for the mute')),

	/** @param {CommandInteraction} interaction */
	execute: async function (interaction) {
		const member = await interaction.guild.members.fetch(interaction.options.getUser('member').id)
			.catch(() => {
				interaction.reply(`Invalid member.`)
			})
		const duration = interaction.options.getString('duration') ?? '1d'
		let reason = interaction.options.getString('reason') ?? `N/A`

		const muted = await interaction.guild.roles.cache.get(Roles.nsfwMuted)

		if (!duration)
			return member.roles.add(muted, reason)
				.then(member => {
					interaction.reply(`${member.user.tag ?? member} has been muted indefinitely in the NSFW Section.`)
				})

		member.roles.add(muted, reason)
			.then(member => {
				interaction.reply(`${member.user.tag ?? member} has been muted for ${prettyMilliseconds(ms(duration), { verbose: true })} in the NSFW Section.`)
			})


		await member.send({ content: `You have been muted in the NSFW Section by **${interaction.member.user.tag}** for ${prettyMilliseconds(ms(duration), { verbose: true })} with **reason**: ${reason}` })
			.catch(() => {})

		NsfwMutes.findOne({ memberID: member.id }, {}, {}, async (err, data) => {
			if (err) throw err
			if (!data) {
				await NsfwMutes.create({
					memberID: member.id,
					unmuteAt: Date.now() + ms(duration),
				})
			} else {
				data.unmuteAt = Date.now() + ms(duration)
				data.save()
			}
		})
	},
}
