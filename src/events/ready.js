import { Client } from 'discord.js'
import zaq from 'zaq'
import mongoose from '../database/mongoose.js'
import PermissionHandler from '../util/permissionHandler.js'
import MuteHandler from '../util/muteHandler.js'

export default {
  name: 'ready',
  once: true,

  /** @param { Client } client */
  async execute (client) {
    zaq.ok(`Ready as ${client.user.tag}`)
    await mongoose.connect(process.env.MONGOOSE_URL)
    await PermissionHandler.setupPermissions(client)
    await MuteHandler.checkMutes(client)
  },
}
