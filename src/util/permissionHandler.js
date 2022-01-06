import Roles from '../constants/roles.js'

export default {
  setupPermissions: async function (client) {
    const commands = await client.application.commands.fetch({ guildId: process.env.GUILD })
    commands.map(x => {
      x.permissions.set({
        permissions: [
          {
            id: Roles.memberRole,
            type: 'ROLE',
            permission: true,
          },
          {
            id: Roles.everyone,
            type: 'ROLE',
            permission: false,
          },
        ],
      })
        .then(() => {})
    })
  },
}
