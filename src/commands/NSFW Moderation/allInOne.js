import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'
import Roles from '../../constants/roles.js'
import NSFWWarnSystem from '../../util/nsfwWarnSystem.js'

export default {
  directory: 'NSFW Moderation',
  usage: `Go Figure`,
  requirements: 'NSFW Moderator',

  data: new SlashCommandBuilder()
    .setName('nsfw')
    .setDescription('NSFW Moderation commands.')
    .addSubcommand(ban => ban
      .setName('ban')
      .setDescription('Ban a member from the NSFW section.')
      .addUserOption(user => user
        .setName('member')
        .setDescription('Member to ban.')
        .setRequired(true))
      .addStringOption(reason => reason
        .setName('reason')
        .setDescription('Reason to ban.')
        .setRequired(true))
    )
    .addSubcommand(unban => unban
      .setName('unban')
      .setDescription('Unban a member from the NSFW section.')
      .addUserOption(user => user
        .setName('member')
        .setDescription('Member to ban.')
        .setRequired(true))
      .addStringOption(reason => reason
        .setName('reason')
        .setDescription('Reason to ban.')
        .setRequired(true))
    )
    .addSubcommand(warn => warn
      .setName('warn')
      .setDescription('Warn a member.')
      .addUserOption(user => user
        .setName('member')
        .setDescription('Member to warn.')
        .setRequired(true))
      .addStringOption(reason => reason
        .setName('reason')
        .setDescription('Reason to warn.')
        .setRequired(true))
    )
    .addSubcommand(removeWarn => removeWarn
      .setName('remove-warn')
      .setDescription('Remove a warn from the member.')
      .addUserOption(member => member
        .setName('member')
        .setDescription('Member to remove the warning of')
        .setRequired(true))
      .addNumberOption(caseNum => caseNum
        .setName('case-number')
        .setDescription('Case number to remove')
        .setRequired(true))
    )
    .addSubcommand(clear => clear
      .setName('clear-warns')
      .setDescription('Clear all warns of a member')
      .addUserOption(member => member
        .setName('member')
        .setDescription('Member to clear the warnings of')
        .setRequired(true))
    )
    .addSubcommand(view => view
      .setName('view-warns')
      .setDescription('View warnings of a member')
      .addUserOption(member => member
        .setName('member')
        .setDescription('Member to view warnings of')
        .setRequired(true))
    ),

  /** @param {CommandInteraction} interaction */
  execute: async function (interaction) {
    const cmd = interaction.options.getSubcommand()
    const user = interaction.options.getUser('member')
    const member = await interaction.guild.members.fetch({ user })
      .catch((e) => {
        interaction.reply(`There was an error finding the member.\nError message: ${e.message}`)
      })
    const reason = interaction.options.getString('reason')

    if (!interaction.member.roles.cache.has(Roles.nsfwModerator) && !interaction.memberPermissions.has('MANAGE_ROLES'))
      return await interaction.reply('Insufficient permissions.')

    switch (cmd) {
      case 'ban':
        if (member.id === interaction.member.user.id)
          return await interaction.reply(`You can't do that to yourself.`)
        else if (!member.manageable)
          return interaction.reply(`I can't NSFW Ban ${member.user.tag ?? member} due to role hierarchy.`)
        else if (member.roles.highest.position >= interaction.member.roles.highest.position)
          return interaction.reply(`You can't NSFW ban ${member.user.tag ?? member} due to role hierarchy.`)

        await member.roles.remove(Roles.nsfwRole)
        await member.roles.add(Roles.nsfwBanned).then(async (member) => {
          await interaction.reply(`${member.user.tag ?? member} has been banned from the NSFW section.`)
          await member.send(`You have been banned from the NSFW section.\nModerator: ${interaction.member.user.tag}\nReason: ${reason}`)
        })
        break
      case 'unban':
        if (member.id === interaction.member.user.id)
          return await interaction.reply(`You can't do that to yourself.`)
        else if (!member.manageable)
          return interaction.reply(`I can't unban ${member.user.tag ?? member} from the NSFW Section due to role hierarchy.`)
        else if (member.roles.highest.position >= interaction.member.roles.highest.position)
          return interaction.reply(`You can't unban ${member.user.tag ?? member} from the NSFW Section due to role hierarchy.`)

        await member.roles.add(Roles.nsfwRole)
        await member.roles.remove(Roles.nsfwBanned).then(async (member) => {
          await interaction.reply(`${member.user.tag ?? member} has been unbanned from the NSFW section.`)
          await member.send(`You have been unbanned from the NSFW section.\nModerator: ${interaction.member.user.tag}\nReason: ${reason}`)
        })
        break
      case 'warn':
        await NSFWWarnSystem.add(interaction)
        break
      case 'remove-warn':
        await NSFWWarnSystem.remove(interaction)
        break
      case 'clear-warns':
        await NSFWWarnSystem.clear(interaction)
        break
      case 'view-warns':
        await NSFWWarnSystem.view(interaction)
        break
    }

  },
}
