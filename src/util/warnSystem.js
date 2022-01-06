import Warns from '../database/models/warns.js'
import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js'
import Roles from '../constants/roles.js'
import AutoPunishment from '../database/models/autoPunishmentSettings.js'
import Mutes from '../database/models/mutes.js'
import ms from 'ms'
import prettyMilliseconds from 'pretty-ms'

export default {
  /** @param {CommandInteraction} interaction */
  add: async function (interaction) {
    const user = interaction.options.getUser('member').id
    const member = await interaction.guild.members.fetch({ user })
      .catch(() => {})
    const reason = interaction.options.getString('reason')

    if (!interaction.member.roles.cache.some(r => [
      Roles.adminRole,
      Roles.modRole,
      Roles.creator,
    ].includes(r.id)))
      return interaction.editReply(`Insufficient permissions.`)

    if (user === interaction.member.user.id)
      return interaction.editReply(
        `Why yes, I'd ${interaction.commandName} you myself if I had the chance to but yeah, this is not happening.`)
    else if (!member.manageable)
      return interaction.editReply(`I can't ${interaction.commandName} ${member.user.tag ?? member} due to role hierarchy.`)
    else if (member.roles.highest.position >= interaction.member.roles.highest.position)
      return interaction.editReply(`You can't ${interaction.commandName} ${member.user.tag ?? member} due to role hierarchy.`)

    Warns.findOne({ memberID: member.id }, {}, {}, async (err, data) => {
      if (err) throw err
      if (!data) {
        data = new Warns({
          memberID: member.id,
          warnings: new Map(),
        })
        data.warnings.set(`${data.warnings.size + 1}`, {
          case: data.warnings.size + 1,
          moderatorID: interaction.member.user.id,
          reason,
          date: `<t:${Math.round(interaction.createdTimestamp / 1000)}:R>`,
        })
        data.save()
      } else {
        data.warnings.set(`${data.warnings.size + 1}`,
          {
            case: data.warnings.size + 1,
            moderatorID: interaction.member.user.id,
            reason,
            date: `<t:${Math.round(interaction.createdTimestamp / 1000)}:R>`,
          },
        )
        data.save()
      }

      await member.send({
        embeds: [
          new MessageEmbed({
            color: 'RED',
            title: `You have been warned in ${interaction.guild.name}`,
            description: `Responsible Moderator: ${interaction.member.user.tag ?? interaction.member}-(${interaction.member.user.id})\nReason: ${reason}`,
            timestamp: new Date(),
          }),
        ],
      }).catch(() => {})
      await this.checkForPunishment(interaction, member)
    })
    await interaction.editReply(`${member.user.tag ?? member} has been warned.`)
  },

  /** @param {CommandInteraction} interaction */
  remove: async function (interaction) {
    const user = interaction.options.getUser('member').id
    const member = await interaction.guild.members.fetch({ user })
      .catch(() => {})
    const caseNum = interaction.options.getNumber('case-number')

    if (!interaction.member.roles.cache.some(r => [
      Roles.adminRole,
      Roles.modRole,
      Roles.creator,
    ].includes(r.id)))
      return interaction.editReply(`Insufficient permissions.`)

    if (user === interaction.member.user.id)
      return interaction.editReply(
        `No cheating.`)
    else if (!member.manageable)
      return interaction.editReply(`I can't ${interaction.commandName} ${member.user.tag ?? member} due to role hierarchy.`)
    else if (member.roles.highest.position >= interaction.member.roles.highest.position)
      return interaction.editReply(`You can't ${interaction.commandName} ${member.user.tag ?? member} due to role hierarchy.`)

    Warns.findOne({ memberID: member.id }, {}, {}, async (err, data) => {
      if (err) throw err
      if (!data)
        return interaction.editReply(`${member.user.tag ?? member} has no warnings.`)
      else if (!data.warnings.has(`${caseNum}`))
        return interaction.editReply(`I couldn't find the warn with the given case number.`)
      data.warnings.delete(`${caseNum}`)
      data.save()
      await interaction.editReply(`Removed the warn with the case number ${caseNum} from ${member.user.tag ?? member}.`)
    })
  },

  /** @param {CommandInteraction} interaction */
  clear: async function (interaction) {
    const user = interaction.options.getUser('member').id
    const member = await interaction.guild.members.fetch({ user })
      .catch(() => {})

    if (!interaction.member.roles.cache.some(r => [Roles.adminRole, Roles.modRole, Roles.creator].includes(r.id)))
      return interaction.editReply(`Insufficient permissions.`)

    if (user === interaction.member.user.id)
      return interaction.editReply(
        `No cheating.`)
    else if (!member.manageable)
      return interaction.editReply(`I can't ${interaction.commandName} ${member.user.tag ?? member} due to role hierarchy.`)
    else if (member.roles.highest.position >= interaction.member.roles.highest.position)
      return interaction.editReply(`You can't ${interaction.commandName} ${member.user.tag ?? member} due to role hierarchy.`)

    Warns.findOne({ memberID: member.id }, {}, {}, (err, data) => {
      if (err) throw err
      if (!data)
        return interaction.editReply(`${member.user.tag ?? member} has no warnings.`)

      data.delete()
      member.send({
        embeds: [
          new MessageEmbed({
            color: 'GREEN',
            title: 'Your Warn History has been cleared!',
            description: `Responsible Moderator: ${interaction.member.user.tag ?? interaction.member}-(${interaction.member.user.id})`,
            timestamp: new Date(),
          }),
        ],
      })
      interaction.editReply(`Cleared the warn history of ${member.user.tag ?? member}.`)
    })
  },

  /** @param {CommandInteraction} interaction */
  view: async function (interaction) {
    const user = interaction.options.getUser('member').id
    const member = await interaction.guild.members.fetch({ user })
      .catch(() => {})

    if (!interaction.member.roles.cache.some(r => [Roles.adminRole, Roles.modRole, Roles.creator].includes(r.id)))
      return interaction.editReply(`Insufficient permissions.`)

    Warns.findOne({ memberID: member.id }, {}, {}, async (err, data) => {
      if (err) throw err
      if (!data)
        return interaction.editReply(`${member.user.tag ?? member} has no warnings.`)

      const fields = []
      for (const value of data.warnings.values()) {
        const moderator = await interaction.guild.members.fetch({ user: value.moderatorID }).catch(() => {})
        fields.push({
          name: `Case: ${value.case}`,
          value: `Moderator: ${moderator.user.tag ?? moderator}\nReason: ${value.reason}\nDate: ${value.date}`,
          inline: true,
        })
      }

      await interaction.editReply({
        embeds: [
          new MessageEmbed({
            color: 'PURPLE',
            title: `${member.user.tag ?? member}'s Warn History`,
            description: 'Please clear out redundant warnings as Discord embeds have a limit of 6000 characters, this function may not work in the future with much warnings.',
            fields,
            footer: { text: `ID: ${member.id}` },
            timestamp: new Date(),
          }),
        ],
      })
    })
  },

  /** @param {CommandInteraction} interaction
   *  @param {GuildMember} member */
  checkForPunishment: async function (interaction, member) {
    Warns.findOne({ memberID: member.id }, {}, {}, async (err, wdata) => {
      if (err) throw err
      if (!wdata) return

      AutoPunishment.findOne({ warns: wdata.warnings.size }, {}, {}, async (err, adata) => {
        if (err) throw err
        if (!adata) return

        switch (adata.punishment) {
          case 'ban':
            await member.send({
              embeds: [
                new MessageEmbed({
                  color: 'RED',
                  title: `You have been banned!`,
                  description: `You have been banned from ${interaction.guild.name} due to the amount of warnings.\nSend a ban appeal if you think you're wrongfully banned.\nhttps://bit.ly/EMBanAppealForm`,
                  timestamp: new Date(),
                }),
              ],
            }).catch(() => {})
            await interaction.guild.members.ban(member, { days: 2, reason: 'Auto Ban' })
            await interaction.followUp(`${member.user.tag} has been banned due to the amount of warnings`)
            wdata.delete()
            break
          case 'kick':
            await member.send({
              embeds: [
                new MessageEmbed({
                  color: 'RED',
                  title: `You have been kicked!`,
                  description: `You have been kicked from ${interaction.guild.name} due to the amount of warnings.`,
                  timestamp: new Date(),
                }),
              ],
            }).catch(() => {})
            await interaction.guild.members.kick(member, 'Auto Kick')
            await interaction.followUp(`${member.user.tag} has been kicked due to the amount of warnings`)
            break
          case 'softban':
            await member.send({
              embeds: [
                new MessageEmbed({
                  color: 'RED',
                  title: `You have been softbanned!`,
                  description: `You have been softbanned from ${interaction.guild.name} due to the amount of warnings.\nJoin back only if you'll follow the rules.\nhttps://discord.gg/eula`,
                  timestamp: new Date(),
                }),
              ],
            }).catch(() => {})
            await interaction.guild.members.ban(member, { reason: 'Auto Softban' })
            await interaction.guild.members.unban(member, 'Auto Softban')
            await interaction.followUp(`${member.user.tag} has been softbanned due to the amount of warnings`)
            wdata.delete()
            break
          case 'mute':
            Mutes.findOne({ memberID: member.id }, {}, {}, async (err, mdata) => {
              if (err) throw err
              if (!mdata) {
                await Mutes.create({
                  memberID: member.id,
                  unmuteAt: Date.now() + ms(adata.duration),
                })
              } else {
                mdata.unmuteAt = Date.now() + ms(adata.duration)
              }
              await member.roles.add(Roles.muteRole)
              await member.send({
                embeds: [
                  new MessageEmbed({
                    color: 'RED',
                    title: `You have been muted!`,
                    description: `You have been muted in ${interaction.guild.name} for ${prettyMilliseconds(ms(adata.duration),
                      { verbose: true },
                    )} due to the amount of warnings.\n`,
                    timestamp: new Date(),
                  }),
                ],
              }).catch(() => {})
              await interaction.followUp(`${member.user.tag} has been muted due to the amount of warnings`)
            })
            break
        }
      })
    })
  },
}
