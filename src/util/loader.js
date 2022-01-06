import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { getDir } from 'file-ez'
import { Ganyu } from '../Ganyu.js'
import { config } from 'dotenv'
import zaq from 'zaq'

config()
const rest = new REST().setToken(process.env.DISCORD_TOKEN)

export default {
  loadCommands: async function () {
    const commands = []
    const commandFiles = await getDir('../commands')
      .recursive()

    for (const file of commandFiles) {
      const command = await file.import()
      Ganyu.commands.set(command.data.name, command)
      commands.push(command.data.toJSON())
    }

    try {
      zaq.info('Started refreshing application (/) commands.')

      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT, process.env.GUILD),
        { body: commands },
      )

      zaq.ok('Successfully reloaded application (/) commands.')
    } catch (error) {
      zaq.err(error)
    }
  },

  loadEvents: async function () {
    const eventFiles = await getDir('../events')
      .recursive()

    for (const file of eventFiles) {
      const event = await file.import()
      if (event.once) {
        Ganyu.once(event.name, (...args) => event.execute(...args))
      } else Ganyu.on(event.name, (...args) => event.execute(...args))
    }
  },
}
