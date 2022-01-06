import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import AutoPunishmentSystem from '../../util/autoPunishmentSystem.js'

export default {
  directory: 'Admin',
  usage: 'Go Figure',
  requirements: 'Admin',
  perms: 'ADMINISTRATOR',

  data: new SlashCommandBuilder()
    .setName('auto-punishments')
    .setDescription('Setup auto punishments for warnings.')
    .addSubcommand(add => add
      .setName('add')
      .setDescription('Add an auto punishment.')
      .addNumberOption(numOfWarns => numOfWarns
        .setName('warns')
        .setDescription('Number of warnings needed to execute the punishment')
        .setRequired(true))
      .addStringOption(punishment => punishment
        .setName('punishment')
        .setDescription('Punishment to execute (kick/ban/softban/mute)')
        .setRequired(true))
      .addStringOption(duration => duration
        .setName('duration')
        .setDescription('Duration for the mute punishment')))
    .addSubcommand(del => del
      .setName('delete')
      .setDescription('Delete an auto punishment')
      .addNumberOption(warns => warns
        .setName('warns')
        .setDescription('Number of punishments that is already setup')
        .setRequired(true)))
    .addSubcommand(list => list
      .setName('list')
      .setDescription('Shows all the auto punishments that are setup')),

  /** @param {CommandInteraction} interaction */
  execute: async function (interaction) {
    await interaction.deferReply()

    const choice = interaction.options.getSubcommand()

    switch (choice) {
      case 'add':
        await AutoPunishmentSystem.add(interaction)
        break
      case 'delete':
        await AutoPunishmentSystem.delete(interaction)
        break
      case 'list':
        await AutoPunishmentSystem.list(interaction)
        break
    }
  },
}
