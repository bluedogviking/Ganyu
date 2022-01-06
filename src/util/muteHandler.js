import mutes from '../database/models/mutes.js'
import { MessageEmbed } from 'discord.js'
import Roles from '../constants/roles.js'

export default {
  checkMutes: async function (client) {
    const guild = await client.guilds.fetch({ guild: process.env.GUILD })
    setInterval(async () => {
      mutes.find(async (err, data) => {
        if (err) throw err
        if (!data) return

        for (const muted of data) {
          if (muted['unmuteAt'] === Infinity) continue

          const member = await guild.members
            .fetch({ user: muted['memberID'] })
            .catch(() => {})

          if (muted['unmuteAt'] <= Date.now()) {
            await member.roles.remove(Roles.muteRole)
            muted.delete()
            member.send({
              embeds: [
                new MessageEmbed({
                  color: 'GREEN',
                  title: `You have been unmuted in ${guild.name}`,
                  description: `This is an automatic unmute.`,
                }),
              ],
            })
              .catch(() => {})
          }
        }
      })
    }, 5000)
  },
}
