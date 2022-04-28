import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js'
import Triggers from '../database/models/triggers.js'
import Roles from '../constants/roles.js'

export default {
  /** @param {CommandInteraction} interaction */
  add: async function (interaction) {
    const trigger = interaction.options.getString('trigger')
    const isEmbed = interaction.options.getBoolean('embed')
    const response = interaction.options.getString('response')

    if (!interaction.member.roles.cache.some(r => [Roles.creator, Roles.guidingGoats, Roles.modRole,Roles.adminRole].includes(r.id)))
      return interaction.editReply(`Insufficient permissions.`)

    if (isEmbed) {
      try {
        const json = JSON.stringify(new MessageEmbed(JSON.parse(response)).toJSON())
        Triggers.findOne({ trigger }, {}, {}, async (err, data) => {
          if (err) throw err
          if (!data) {
            await Triggers.create({
              trigger,
              author: interaction.member.user.id,
              isEmbed,
              json,
              date: `<t:${Math.round(interaction.createdTimestamp / 1000)}:R>`,
            })
            await interaction.editReply(`Added \`${trigger}\``)
          } else await interaction.editReply(`\`${trigger}\` already exists`)
        })
      } catch (e) {
        await interaction.editReply(e.message)
      }
    } else
      Triggers.findOne({ trigger }, {}, {}, async (err, data) => {
        if (err) throw err
        if (!data) {
          await Triggers.create({
            trigger,
            author: interaction.member.user.id,
            isEmbed,
            response: response.replaceAll('\\n', '\n'),
            date: `<t:${Math.round(interaction.createdTimestamp / 1000)}:R>`,
          })
          await interaction.editReply(`Added \`${trigger}\``)
        } else await interaction.editReply(`\`${trigger}\` already exists`)
      })
  },

  /** @param {CommandInteraction} interaction */
  delete: async function (interaction) {
    const trigger = interaction.options.getString('trigger')

    if (!interaction.member.roles.cache.some(r => [Roles.creator, Roles.guidingGoats, Roles.modRole,Roles.adminRole].includes(r.id)))
      return interaction.editReply(`Insufficient permissions.`)

    Triggers.findOne({ trigger }, {}, {}, (err, data) => {
      if (err) throw err
      if (!data)
        return interaction.editReply(`\`${trigger}\` does not exist`)
      data.delete()
      interaction.editReply(`Deleted \`${trigger}\``)
    })
  },

  /** @param {CommandInteraction} interaction */
  view: async function (interaction) {
    const trigger = interaction.options.getString('trigger')

    if (!interaction.member.roles.cache.some(r => [Roles.creator, Roles.guidingGoats, Roles.modRole,Roles.adminRole].includes(r.id)))
      return interaction.editReply(`Insufficient permissions.`)

    Triggers.findOne({ trigger }, {}, {}, async (err, data) => {
      if (err) throw err
      if (!data)
        return interaction.editReply(`\`${trigger}\` does not exist`)

      const author = await interaction.guild.members.fetch({ user: data.author }).catch(() => {})
      if (data.isEmbed) {
        await interaction.editReply({
          embeds: [
            new MessageEmbed({
              author: {
                name: author.user.tag,
                iconURL: author.user.avatarURL({ dynamic: true }),
              },
              color: 'RANDOM',
              title: trigger,
              description: `Since response is an embed, I'll simulate it as if you triggered it. You can see what you get from this trigger in the embed form below.\n\nJSON Format for curious kittens: \`\`\`${JSON.stringify(
                JSON.parse(data.json),
                null,
                4,
              )}\`\`\`\nAdded ${data.date}`,
              timestamp: new Date(),
            }), new MessageEmbed(JSON.parse(data.json)),
          ],
        })
      } else await interaction.editReply({
        embeds: [
          new MessageEmbed({
            author: {
              name: author.user.tag,
              iconURL: author.user.avatarURL({ dynamic: true }),
            },
            color: 'RANDOM',
            title: trigger,
            description: `This is a regular trigger just like what you used to do, *cough* \`.<trigger>\` or \`e.<trigger>\` *cough*\nSee response below.\n\n**Response**\n${data.response}\n\nAdded ${data.date}`,
            timestamp: new Date(),
          }),
        ],
      })
    })
  },

  /** @param {CommandInteraction} interaction */
  list: async function (interaction) {
    Triggers.find(async (err, data) => {
      if (err) throw err
      if (data.length === 0)
        return interaction.editReply(`There are no triggers yet`)

      await interaction.editReply({
        files: [
          new MessageAttachment(Buffer.from(data.map(value => {
            return `# Trigger\n- ${value['trigger']}\n`
          }).sort().join('\n')), 'triggers.md'),
        ],
      })
    })
  },
}
