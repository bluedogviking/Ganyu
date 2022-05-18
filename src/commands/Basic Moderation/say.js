import { CommandInteraction } from 'discord.js'

import { SlashCommandBuilder } from '@discordjs/builders'

export default {
  directory: 'Admin',
  usage: `[channel] message`,
  requirements: 'Mods, probably.',
  perms: 1n << 13n,

  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Bot repeats your message in a given channel or in the same channel.')
    .addStringOption(msg => msg
      .setName('message')
      .setDescription('What do you want me to say?')
      .setRequired(true),
    )
    .addChannelOption(ch => ch
      .setName('channel')
      .setDescription('Which channel do you want me to send the message to?')
      .setRequired(true),
    ),

  /** @param {CommandInteraction} interaction */
  execute: async function (interaction) {
    await interaction.deferReply({ ephemeral: true })
    const ch = interaction.options.getChannel('channel')
    const channel = await interaction.guild.channels.fetch(ch?.id)
      .catch((e) => {interaction.editReply(`There was an error finding the channel.\nError message: ${e.message}`)})
    const msg = interaction.options.getString('message')

    channel.send(msg).then(async () => {
      await interaction.editReply('Sent!')
    })
  },
}
