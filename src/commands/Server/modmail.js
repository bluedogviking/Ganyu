import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import ModmailSystem from '../../util/modmailSystem.js'

export default {
  directory: 'Modmail',
  usage: 'Go Figure',
  requirements: 'Members/Admin',

  data: new SlashCommandBuilder()
    .setName('modmail')
    .setDescription('Modmail system allows you to reach out to our staff.')
    .addSubcommand(req => req
      .setName('request')
      .setDescription('Send a request to the staff team to open a modmail ticket')
      .addStringOption(reason => reason
        .setName('reason')
        .setDescription('Please provide a brief description of what your modmail is about')
        .setRequired(true)))
    .addSubcommand(del => del
      .setName('delete')
      .setDescription('Delete a modmail ticket')
      .addUserOption(member => member
        .setName('member')
        .setDescription('Author of the ticket')
        .setRequired(true))
      .addStringOption(reason => reason
        .setName('reason')
        .setDescription('Reason for closing the ticket'))),

  /** @param {CommandInteraction} interaction */
  execute: async function (interaction) {
    const choice = interaction.options.getSubcommand()

    switch (choice) {
      case 'request':
        await ModmailSystem.request(interaction)
        break
      case 'delete':
        await ModmailSystem.del(interaction)
        break
    }
  },
}
