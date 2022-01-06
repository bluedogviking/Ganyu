import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import WarnSystem from '../../util/warnSystem.js'

export default {
  directory: 'Basic Moderation',
  usage: 'Go Figure',
  requirements: 'Moderator',

  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn System')
    .addSubcommand(add => add
      .setName('add')
      .setDescription('Issue a warning to a member')
      .addUserOption(member => member
        .setName('member')
        .setDescription('Member to issue a warn')
        .setRequired(true))
      .addStringOption(reason => reason
        .setName('reason')
        .setDescription('Warning message')
        .setRequired(true)))
    .addSubcommand(remove => remove
      .setName('remove')
      .setDescription('Remove a warning from a member')
      .addUserOption(member => member
        .setName('member')
        .setDescription('Member to remove the warning of')
        .setRequired(true))
      .addNumberOption(caseNum => caseNum
        .setName('case-number')
        .setDescription('Case number to remove')
        .setRequired(true)))
    .addSubcommand(clear => clear
      .setName('clear')
      .setDescription('Clear removed warnings of a member')
      .addUserOption(member => member
        .setName('member')
        .setDescription('Member to clear the warnings of')
        .setRequired(true)))
    .addSubcommand(view => view
      .setName('view')
      .setDescription('View warnings of a member')
      .addUserOption(member => member
        .setName('member')
        .setDescription('Member to view warnings of')
        .setRequired(true))),

  /** @param {CommandInteraction} interaction */
  execute: async function (interaction) {
    await interaction.deferReply()

    const choice = interaction.options.getSubcommand()

    switch (choice) {
      case 'add':
        await WarnSystem.add(interaction)
        break
      case 'remove':
        await WarnSystem.remove(interaction)
        break
      case 'clear':
        await WarnSystem.clear(interaction)
        break
      case 'view':
        await WarnSystem.view(interaction)
        break
    }
  },
}
