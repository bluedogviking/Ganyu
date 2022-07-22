import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import Triggers from '../../database/models/triggers.js'

export default {
  directory: 'Triggers',
  usage: 'trigger',
  requirements: 'Members',

  data: new SlashCommandBuilder()
    .setName('trigger')
    .setDescription('Triggers a trigger.')
    .addStringOption(trigger => trigger
      .setName('trigger')
      .setDescription('Name of the trigger')
      .setRequired(true)),

  /** @param {CommandInteraction} interaction */
  execute: async function (interaction) {
    const trigger = interaction.options.getString('trigger')

    Triggers.findOne({ trigger }, {}, {}, async (err, data) => {
      if (err) throw err
      if (!data)
        return interaction.reply(`\`${trigger}\` does not exist`)
      if (data.isEmbed) {
        await interaction.reply({ embeds: [new MessageEmbed(JSON.parse(data.json))] })
      } else {
        await interaction.reply(data.response)
      }
    })
  },
}
