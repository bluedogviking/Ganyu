import { CommandInteraction, MessageActionRow, MessageAttachment, MessageButton, MessageEmbed } from 'discord.js'
import Roles from '../constants/roles.js'
import Modmails from '../database/models/modmails.js'

export default {
  essentials: {
    'hubChannel': '928757367426920528',
    'parentCategory': '839414864631169034',
    'logsChannel': '839414982323601408',
  },
  /** @param {CommandInteraction} interaction */
  request: async function (interaction) {
    const reason = interaction.options.getString('reason')

    const hasTicket = await Modmails.findOne({
      memberID: interaction.member.user.id,
    })
    if (hasTicket) return interaction.reply(`You already have a ticket request on hold, please wait for its approval.`)

    const hub = interaction.guild.channels.cache.get(this.essentials.hubChannel)

    if (reason > 1024) return reason.slice(1022, 1024).concat('...')

    const row = new MessageActionRow()
      .addComponents([
        new MessageButton()
          .setCustomId('accept')
          .setStyle('SUCCESS')
          .setLabel('Aggsept')
          .setEmoji('<a:ganyuyes:892727613255217152>'),
        new MessageButton()
          .setCustomId('decline')
          .setStyle('DANGER')
          .setLabel('Noppers')
          .setEmoji('<a:ganyuNo:876129975454011512>'),
      ])

    await hub.send({
      content: `ignore this modmail`, embeds: [
        new MessageEmbed({
          color: 'RANDOM',
          author: {
            name: interaction.member.user.username,
            iconURL: interaction.member.user.displayAvatarURL({ dynamic: true }),
          },
          title: `New Ticket Request by ${interaction.member.user.tag}`,
          description: `Their reason was:\n${reason}`,
          footer: {
            text: `ID: ${interaction.member.user.id}`,
          },
        }),
      ], components: [row],
    }).then((msg) => {
      Modmails.create({
        memberID: interaction.member.user.id,
      })

      const collector = msg.createMessageComponentCollector({
        componentType: 'BUTTON',
      })

      collector.on('collect', async i => {
        if (!i.member.roles.cache.some(r => [
          Roles.adminRole,
          Roles.modRole,
        ].includes(r.id))) return

        switch (i.customId) {
          case 'accept':
            collector.stop()
            msg.edit({ content: ' ', components: [] })
            await i.reply({
              content: `Modmail request accepted, request has been terminated.\nTransmitting redirection message to the member...\n**Responsible Moderator for acceptance is ${i.member.user.tag}**`,
            })
            await interaction.guild.channels.create(`ticket-${interaction.member.user.discriminator.slice(2, 4)
              .concat(Math.floor(Math.random() * 101).toString())}`, {
              reason: 'modmail',
              parent: this.essentials.parentCategory,
              type: 'GUILD_TEXT',
              permissionOverwrites: [
                {
                  id: Roles.adminRole,
                  type: 'role',
                  allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                }, {
                  id: Roles.modRole,
                  type: 'role',
                  allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                }, {
                  id: Roles.everyone,
                  type: 'role',
                  deny: ['VIEW_CHANNEL'],
                }, {
                  id: interaction.member.user.id,
                  type: 'member',
                  allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                },
              ],
            }).then(async (c) => {
              await Modmails.updateOne({ memberID: interaction.member.user.id }, { channelID: c.id }, { upsert: true })
              await interaction.member.user.send({
                embeds: [
                  new MessageEmbed({
                    color: 'GREEN',
                    title: `About your modmail request...`,
                    description: `Your modmail request was accepted by ${i.member.user.tag}\nPlease proceed to ${c}!`,
                    timestamp: new Date(),
                  }),
                ],
              }).catch(() => {})
              await c.send({ content: `${interaction.member}, please wait. Our staff team will get to you as soon as possible!\nReason reminder for staff: ${reason}` })
            })
            break
          default:
            collector.stop()
            await Modmails.findOneAndDelete({ memberID: interaction.member.user.id })
            msg.edit({
              content: ' ',
              components: [],
            })
            await i.reply({
              content: `Modmail request declined, request has been terminated.\nTransmitting sad message to the member...\n**Responsible Moderator for refusal is ${i.member.user.tag}**`,
            })
            interaction.member.user.send({
              embeds: [
                new MessageEmbed({
                  color: 'RED',
                  title: `About your modmail request...`,
                  description: `Your modmail request was declined by ${i.member.user.tag}\nFeel free to request another modmail ticket if you need!`,
                  timestamp: new Date(),
                }),
              ],
            }).catch(() => {})
            break
        }
      })
    })
    await interaction.reply(`Request was sent to the staff team, please wait for approval, this might take a while.`)
  },

  /** @param {CommandInteraction} interaction */
  del: async function (interaction) {
    if (!interaction.member.roles.cache.some(r => [
      Roles.adminRole,
      Roles.modRole,
    ].includes(r.id))) return interaction.reply(`You can't delete a ticket due to permission requirements`)

    const user = interaction.options.getUser('member').id
    const member = await interaction.guild.members.fetch({ user }).catch(() => {})
    let reason = interaction.options.getString('reason') ?? `No reason provided`

    if (!user) return interaction.reply(`Please provide an author of a ticket`)

    const logChannel = interaction.guild.channels.cache.get(this.essentials.logsChannel)

    Modmails.findOne({ memberID: member.user.id }, {}, {}, async (err, data) => {
      if (err) throw err
      if (!data) return interaction.reply('Invalid argument')
      const channel = await interaction.guild.channels.fetch(data['channelID']).catch(() => {})
      const messages = await channel.messages.fetch().catch(() => {interaction.reply('Errorge')})
      let messageLogs = []
      messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp).map(m => {
        if (m.author.bot) return
        if (m.attachments.size > 0) {
          m.attachments.forEach(attachment => {
            messageLogs.push(`${m.author.tag}: ${m.content}\nAttachment [${attachment.url}]`)
          })
        } else {
          messageLogs.push(`${m.author.tag}: ${m.content}`)
        }
      })
      await logChannel.send({
        content: `${member.user.tag}'s ticket was closed by ${interaction.member.user.tag} with reason: ${reason}\nView attachment below for full logs;`,
        files: [
          new MessageAttachment(Buffer.from(messageLogs.join('\n')),
            `${interaction.member.user.username}-logs.txt`,
          ),
        ],
      })
      await channel.delete('ticket deleted')
      await member.send({
        embeds: [
          new MessageEmbed({
            color: 'RANDOM',
            title: `About your modmail ticket...`,
            description: `Your modmail ticket was closed by ${interaction.member.user.tag} with reason: ${reason}\nWe hope we helped you, feel free to reach out to us again in the future!`,
            timestamp: new Date(),
          }),
        ],
      })
      data.delete()
    })
  },

  /** @param {CommandInteraction} interaction */
  help: async function (interaction) {
    await interaction.reply({
      embeds: [
        new MessageEmbed({
          color: 'RANDOM',
          title: 'How to use Modmail',
          description: 'There are two functional commands in modmail, one of which only staff can use, other one is what you will be using.',
          fields: [
            {
              name: '/modmail request',
              value: 'Request command is used to create a modmail ticket by requesting it from staff with a reason, when you enter the command with a reason, staff team will be pinged and they will either accept or reject the request.\nIf accepted, a new channel will be created and you will be pinged in there...\n\n**I.E.**\n/modmail request __reason:__ role request',
              inline: false
            }
          ]
        })
      ]
    })
  }
}
