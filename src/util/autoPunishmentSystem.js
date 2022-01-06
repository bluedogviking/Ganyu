import ms from 'ms'
import prettyMilliseconds from 'pretty-ms'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import AutoPunishment from '../database/models/autoPunishmentSettings.js'

export default {
  /** @param {CommandInteraction} interaction */
  add: async function (interaction) {
    const warns = interaction.options.getNumber('warns')
    const punishment = interaction.options.getString('punishment')
    const duration = interaction.options.getString('duration')

    if (!['kick', 'ban', 'softban', 'mute'].includes(punishment))
      return await interaction.editReply('Please enter a valid punishment (kick/ban/softban/mute)')
    else if (punishment === 'mute' && !duration)
      return await interaction.editReply('Please provide a duration for the mute.')

    AutoPunishment.findOne({ warns }, {}, {}, (err, data) => {
      if (err) throw err
      if (!data) {
        AutoPunishment.create({
          warns,
          punishment,
          duration: duration ? ms(duration) : Infinity,
        })
        if (punishment === 'mute')
          return interaction.editReply(`Successfully setup \`${warns} warns\` punishment to execute \`${punishment}\` punishment with ${prettyMilliseconds(
            ms(duration), { verbose: true })} duration`)
        interaction.editReply(`Successfully setup \`${warns} warns\` punishment to execute \`${punishment}\` punishment`)
      } else {
        data.warns = warns
        data.punishment = punishment
        data.duration = duration ? ms(duration) : Infinity
        data.save()
        if (punishment === 'mute')
          return interaction.editReply(`Successfully edited \`${warns} warns\` punishment to execute \`${punishment}\` punishment with ${prettyMilliseconds(
            ms(duration), { verbose: true })} duration`)
        interaction.editReply(`Successfully edited \`${warns} warns\` punishment to execute \`${punishment}\` punishment`)
      }
    })
  },

  /** @param {CommandInteraction} interaction */
  delete: async function (interaction) {
    const warns = interaction.options.getNumber('warns')
    AutoPunishment.findOne({ warns }, {}, {}, (err, data) => {
      if (err) throw err
      if (!data)
        return interaction.editReply(`No auto punishment was found with \`${warns} warns\``)
      data.delete()
      interaction.editReply(`Deleted the auto punishment with \`${warns} warns\``)
    })
  },

  /** @param {CommandInteraction} interaction */
  list: async function (interaction) {
    AutoPunishment.find((err, data) => {
      if (err) throw err
      if (data.length === 0)
        return interaction.editReply('There are no auto punishments setup')

      const fields = []
      data.map(p => fields.push({
        name: `${p['warns']} Warns`,
        value: `Punishment: ${p['punishment']}\n${p['duration'] !== 'Infinity' ? `Duration: ${prettyMilliseconds(ms(
            p['duration']),
          { verbose: true },
        )}` : ''}`,
        inline: true,
      }))
      fields.sort((a, b) => a.name.charAt(0) - b.name.charAt(0))
      interaction.editReply({
        embeds: [
          new MessageEmbed({
            color: 'RANDOM',
            title: `Auto Punishments`,
            description: `Format:\nNumber of warns to execute the punishment\nPunishment`,
            fields,
            timestamp: new Date(),
          }),
        ],
      })
    })
  },
}
