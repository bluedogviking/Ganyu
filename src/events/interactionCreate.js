import { CommandInteraction } from 'discord.js'

export default {
  name: 'interactionCreate',

  /** @param {CommandInteraction} interaction */
  async execute (interaction) {
    try {
      if (interaction.isCommand()) {
        const command = interaction.client['commands'].get(interaction.commandName)
        if (!command) return interaction.reply({
          content: 'Something went wrong.',
          ephemeral: true,
        })

        if (command.perms && !interaction.member.permissions.has(command.perms))
          return interaction.reply({ content: 'Insufficient permissions.', ephemeral: true })

        await command.execute(interaction)
      }
    } catch (err) {
      console.log(err)
    }
  },
}
