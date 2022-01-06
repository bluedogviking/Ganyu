import { CommandInteraction } from 'discord.js'
import CustomRoles from '../database/models/customRoles.js'
import Roles from '../constants/roles.js'

export default {
  essentials: {
    'nitroBoosterRole': '790760417265844236',
    'parentRole': '807040777120251904',
  },

  /** @param {CommandInteraction} interaction */
  create: async function (interaction) {
    const roleName = interaction.options.getString('role-name')
    const roleColor = interaction.options.getString('role-color')
    const roleIcon = interaction.options.getString('role-icon') ?? null

    const nitroBoosterRole = await interaction.guild.roles.fetch(this.essentials.nitroBoosterRole).catch(() => {})
    const isBoosting = interaction.member.roles.cache.has(nitroBoosterRole.id)
    const parentRole = await interaction.guild.roles.fetch(this.essentials.parentRole).catch(() => {})

    if (!isBoosting) {
      return await interaction.editReply(
        'I\'m sorry, but only those who boosted the server can wield this great power of customization.')
    }

    await interaction.guild.roles.create({
      color: roleColor,
      name: roleName,
      icon: roleIcon,
      position: parentRole.position - 1,
      reason: 'Custom Role',
    }).then(role => {
      CustomRoles.findOne({ memberID: interaction.member.user.id }, {}, {}, async (err, data) => {
        if (err) throw err
        if (!data) {
          await CustomRoles.create({
            memberID: interaction.member.user.id,
            roleID: role.id,
          })
          await interaction.member.roles.add(role.id)
          return interaction.editReply('I have created your custom role and assigned it to you, enjoy.')
        } else {
          await interaction.editReply('You already have one custom role bound to yourself.')
        }
      })
    }).catch((e) => {
      interaction.editReply(`There was an error while creating your role.\n${e.message}`)
    })
  },

  /** @param {CommandInteraction} interaction */
  change: async function (interaction) {
    const property = interaction.options.getString('property')
    const value = interaction.options.getString('value')

    if (!['name', 'color', 'icon'].includes(property)) return await interaction.editReply(
      'Please enter a valid property (name/color/icon)')

    CustomRoles.findOne({ memberID: interaction.member.user.id }, {}, {}, async (err, data) => {
      if (err) throw err
      if (!data) return interaction.editReply('You don\'t even have a custom role, what are you trying to change?')

      const role = await interaction.guild.roles.fetch(data['roleID']).catch(() => {})

      switch (property) {
        case 'name':
          await interaction.guild.roles.edit(role, {
            name: value,
          }).then(() => {
            return interaction.editReply(`Your role name is now updated`)
          }).catch((e) => {
            return interaction.editReply(`There was an error trying to update your role.\n${e.message}`)
          })
          break
        case 'color':
          await interaction.guild.roles.edit(role, {
            color: value,
          }).then(() => {
            return interaction.editReply(`Your role color is now updated`)
          }).catch((e) => {
            return interaction.editReply(`There was an error trying to update your role.\n${e.message}`)
          })
          break
        case 'icon':
          await interaction.guild.roles.edit(role, {
            icon: value,
          }).then(() => {
            return interaction.editReply(`Your role icon is now updated`)
          }).catch((e) => {
            return interaction.editReply(`There was an error trying to update your role.\n${e.message}`)
          })
          break
      }
    })
  },

  /** @param {CommandInteraction} interaction */
  delet: async function (interaction) {
    const user = interaction.options.getUser('member').id
    const member = await interaction.guild.members.fetch({ user }).catch(() => {})

    if (!interaction.member.roles.cache.some(r => [Roles.adminRole, Roles.headModRole, Roles.creator].includes(r.id)))
      return await interaction.editReply('Only staff can delete someone else\'s custom role.')

    if (!member) return await interaction.editReply('Can\'t find/invalid member.')

    CustomRoles.findOne({ memberID: member.id }, {}, {}, async (err, data) => {
      if (err) throw err
      if (!data) return interaction.editReply(`${member.user.tag ?? member} does not have a custom role.`)
      const role = await interaction.guild.roles.fetch(data['roleID']).catch(() => {})
      await interaction.guild.roles.delete(role).then(async () => {
        data.delete()
        await member.send(`Your custom role has been deleted by ${interaction.member.user.tag}.`)
        return interaction.editReply(`Deleted the custom role of ${member.user.tag ?? member}`)
      }).catch(() => {
        interaction.editReply('There was an error while deleting the role.')
      })
    })
  },
}
