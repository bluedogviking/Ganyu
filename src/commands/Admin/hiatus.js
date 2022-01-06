import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import Hiatus from '../../database/models/hiatus.js'
import Roles from '../../constants/roles.js'

export default {
  directory: 'Admin',
  usage: 'hiatus @member',
  requirements: 'Admin',
  perms: 'ADMINISTRATOR',

  data: new SlashCommandBuilder()
    .setName('hiatus')
    .setDescription('Send someone to hiatus.')
    .addUserOption(user => user
      .setName('member')
      .setDescription('Member to evaporate')
      .setRequired(true)),

  /** @param {CommandInteraction} interaction */
  execute: async function (interaction) {
    await interaction.deferReply()

    const user = interaction.options.getUser('member').id
    const member = await interaction.guild.members.fetch({ user })

    Hiatus.findOne({ memberID: member.id }, {}, {}, (err, data) => {
      if (err) throw err
      if (!data) {
        // @hiatus
        member.roles.set([Roles.hiatus])
        data = new Hiatus({
          memberID: member.id,
          roles: new Map(),
        })
        data.roles.set('roles', member.roles.cache.map(r => r.id))
        data.save()
        interaction.editReply(`Sent ${member.user.tag} to hiatus`)
      } else {
        data.delete()
        // ignore @everyone
        const roles = data.roles.get('roles').filter(r => r !== Roles.everyone)
        // @hiatus
        member.roles.remove(Roles.hiatus)
        member.roles.set(roles)
        interaction.editReply(`Brought ${member.user.tag} back from hiatus`)
      }
    })
  },
}
