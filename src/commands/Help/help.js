import { CommandInteraction, MessageEmbed } from 'discord.js'

import { SlashCommandBuilder } from '@discordjs/builders'
import helper from '../../util/helpSystem.js'

export default {
  directory: 'Helper',
  usage: `menu / command name`,
  requirements: 'Members',

  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Learn more about my commands! (You have 1 minutes until it expires.)')
    .addSubcommand(menu => menu
      .setName('menu')
      .setDescription('Brings up the help menu.'),
    )
    .addSubcommand(search => search
      .setName('search')
      .setDescription('Shows more information about the given command.')
      .addStringOption(command => command
        .setName('command')
        .setDescription('Command to look for')
        .setRequired(true)),
    ),

  /** @param {CommandInteraction} interaction */
  execute: async function (interaction) {
    try {
      await interaction.deferReply()

      const choice = interaction.options.getSubcommand()

      switch (choice) {
        case 'menu':
          await helper.start(interaction)
          break

        case 'search':
          const requestedCommand = interaction.options.getString('command')
          const command = interaction.client['commands'].get(requestedCommand)

          if (!command)
            return interaction.editReply(`I don't have any command named \`${requestedCommand}\`.`)

          await interaction.editReply({
            embeds: [
              new MessageEmbed({
                author: {
                  name: interaction.client.user.username,
                  iconURL: interaction.client.user.avatarURL({ dynamic: true }),
                },
                color: 'RANDOM',
                title: command.data.name,
                description: command.data.description,
                fields: [
                  {
                    name: 'Usage', value: command.usage ?? 'Not assigned', inline: true,
                  }, {
                    name: 'Required Permissions', value: command.requirements ?? 'None', inline: true,
                  },
                ],
                timestamp: new Date(),
              }),
            ],
          })
          break
      }

    } catch (err) {
      console.log(err)
    }
  },
}
