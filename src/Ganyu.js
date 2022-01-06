import { Client, Collection } from 'discord.js'
import { config } from 'dotenv'
import loader from './util/loader.js'

config()

export const Ganyu = new Client({ intents: 32767 })
Ganyu.commands = new Collection()

await loader.loadCommands()
await loader.loadEvents()

await Ganyu.login()
