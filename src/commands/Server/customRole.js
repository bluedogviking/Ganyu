import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import CustomRoleSystem from '../../util/customRoleSystem.js'

export default {
  directory: 'Server',
  usage: 'Go Figure',
  requirements: 'Members/Admin',

  data: new SlashCommandBuilder()
    .setName('myrole')
    .setDescription('Custom role system for nitro boosters!')
    .addSubcommand(create => create
      .setName('create')
      .setDescription('Create a custom role for yourself')
      .addStringOption(roleName => roleName
        .setName('role-name')
        .setDescription('Name of the role')
        .setRequired(true))
      .addStringOption(roleColor => roleColor
        .setName('role-color')
        .setDescription('Color of the role')
        .setRequired(true))
      .addStringOption(roleIcon => roleIcon
        .setName('role-icon')
        .setDescription('Icon of the role')
        .setRequired(false)))
    .addSubcommand(change => change
      .setName('change')
      .setDescription('Change properties of your role.')
      .addStringOption(property => property
        .setName('property')
        .setDescription('Property you want to change (name/color/icon)')
        .setRequired(true))
      .addStringOption(value => value
        .setName('value')
        .setDescription('New value of the property')
        .setRequired(true)))
    .addSubcommand(delet => delet
      .setName('delete')
      .setDescription('Delete a custom role of a member.')
      .addUserOption(user => user
        .setName('member')
        .setDescription('Member to delete the role of')
        .setRequired(true))),

  /** @param {CommandInteraction} interaction */
  execute: async function (interaction) {
    await interaction.deferReply()
    const choice = interaction.options.getSubcommand()

    switch (choice) {
      case 'create':
        await CustomRoleSystem.create(interaction)
        break
      case 'change':
        await CustomRoleSystem.change(interaction)
        break
      case 'delete':
        await CustomRoleSystem.delet(interaction)
        break
    }
  },
}
