import Mutes from '../database/models/mutes.js'
import { MessageEmbed } from 'discord.js'
import Roles from '../constants/roles.js'
import NsfwMutes from '../database/models/nsfwMutes.js'

export default {
	checkMutes: async function (client) {
		const guild = await client.guilds.fetch({ guild: process.env.GUILD })
		setInterval(async () => {
			Mutes.find(async (err, data) => {
				if (err) throw err
				if (!data) return

				for (const muted of data) {
					if (muted['unmuteAt'] === Infinity) continue

					const member = await guild.members
						.fetch({ user: muted['memberID'] })
						.catch(() => {
							muted.delete()
						})

					if (muted['unmuteAt'] <= Date.now()) {
						await member.roles.remove(Roles.muted)
						muted.delete()
						member.send({
								embeds: [new MessageEmbed({
									color: 'GREEN',
									title: `You have been unmuted in ${guild.name}`,
									description: `This is an automatic unmute.`,
								})],
							})
							.catch(() => {
							})
					}
				}
			})
		}, 10000)
	},

	checkNsfwMutes: async function (client) {
		const guild = await client.guilds.fetch({ guild: process.env.GUILD })
		setInterval(async () => {
			NsfwMutes.find(async (err, data) => {
				if (err) throw err
				if (!data) return

				for (const muted of data) {
					const member = await guild.members
						.fetch({ user: muted['memberID'] })
						.catch(() => {
							muted.delete()
						})

					if (muted['unmuteAt'] <= Date.now()) {
						await member.roles.remove(Roles.nsfwMuted)
						muted.delete()
						member.send({ content: `Your NSFW Mute has been removed automatically.` })
							.catch(() => {})
					}
				}
			})
		}, 10000)
	},
}
