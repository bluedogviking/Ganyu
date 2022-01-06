import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import Triggers from '../../database/models/triggers.js'
import TriggerSystem from '../../util/triggerSystem.js'

export default {
  directory: 'Triggers',
  usage: `Go Figure`,
  requirements: 'Admin/Members',

  data: new SlashCommandBuilder()
    .setName('triggers')
    .setDescription('Trigger system.')
    .addSubcommand(add => add
      .setName('add')
      .setDescription('Adds a trigger')
      .addStringOption(trigger => trigger
        .setName('trigger')
        .setDescription('Name of the trigger')
        .setRequired(true))
      .addBooleanOption(isEmbed => isEmbed
        .setName('embed')
        .setDescription('Is the response gonna be an embed?')
        .setRequired(true))
      .addStringOption(response => response
        .setName('response')
        .setDescription('Response of the trigger')
        .setRequired(true)))
    .addSubcommand(del => del
      .setName('delete')
      .setDescription('Deletes a trigger')
      .addStringOption(trigger => trigger
        .setName('trigger')
        .setDescription('Name of the trigger')
        .setRequired(true)))
    .addSubcommand(view => view
      .setName('view')
      .setDescription('Lookup a specific trigger')
      .addStringOption(trigger => trigger
        .setName('trigger')
        .setDescription('Name of the trigger')
        .setRequired(true)))
    .addSubcommand(list => list
      .setName('list')
      .setDescription('Lists all available triggers')),

  /** @param {CommandInteraction} interaction */
  execute: async function (interaction) {
    await interaction.deferReply()
    const choice = interaction.options.getSubcommand()

    switch (choice) {
      case 'add':
        await TriggerSystem.add(interaction)
        break
      case 'delete':
        await TriggerSystem.delete(interaction)
        break
      case 'view':
        await TriggerSystem.view(interaction)
        break
      case 'list':
        await TriggerSystem.list(interaction)
        break
    }
  },
}
