import { GuildMember, MessageEmbed } from 'discord.js'

export default {
  name: 'guildMemberAdd',
  once: false,

  /** @param { GuildMember } member */
  async execute (member) {
    const welcomeChannel = await member.guild.channels.fetch('808150446689615903', { cache: true }).catch(() => {})

    welcomeChannel.send({
      content:
        `Welcome to the Golden House, ${member}! Check out <#887126756354580480> to get access to the rest of the server!`,
      embeds: [
        new MessageEmbed({
          color: 'BLUE',
          thumbnail: { url: member.user.displayAvatarURL({ dynamic: true }) },
          title: `Welcome to ${member.guild.name}`,
          description: `**Welcome to ${member.guild.name}, ${member.user.tag ?? member}!**\nMake sure to read <#926212945871003678>`,
          image: {
            url: 'https://cdn.discordapp.com/attachments/805893251042902047/808827618094350336/GanyuBanner20FPS.gif',
          },
        }),
      ],
    })
  },
}
