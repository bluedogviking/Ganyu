import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js'

export default {
  start: async function (interaction) {
    const dirs = [...new Set(interaction.client['commands'].map((c) => c.directory ?? 'Not Assigned'))]

    const helpArray = dirs.map((d) => {
      const getCommands = interaction.client['commands']
        .filter((c) => c.directory === d)
        .map((c) => {
          return {
            name: c.data.name || 'No Name',
            description: `${c.data.description}\n__Required Permissions__\n\`${c.requirements ?? 'None'}\`` || 'No Description',
          }
        })
      return {
        name: d, commands: getCommands,
      }
    })

    let pageNo = 1

    const embed = new MessageEmbed()
      .setColor('PURPLE')
      .setFooter(
        {
          text: `Page ${pageNo}/${helpArray.length} | Do "/help command name" for more information about a specific command`,
        })

    const getButtons = pageNo => new MessageActionRow({
      components: [
        new MessageButton()
          .setLabel('Previous')
          .setCustomId('prev')
          .setStyle('SUCCESS')
          .setEmoji('◀')
          .setDisabled(pageNo <= 1),
        new MessageButton()
          .setLabel('Next')
          .setCustomId('next')
          .setStyle('SUCCESS')
          .setEmoji('▶')
          .setDisabled(!(pageNo < helpArray.length)),
        new MessageButton()
          .setLabel('Exit')
          .setCustomId('exit')
          .setStyle('DANGER')
          .setEmoji('✖')
          .setDisabled(false),
      ],
    })

    embed.setDescription(`**${helpArray[pageNo - 1].name}**`)
      .addFields(helpArray[pageNo - 1].commands.map(({
        name, description,
      }) => {
        return {
          name: `\`${name}\``, value: `${description}`, inline: true,
        }
      }))

    const interactionMsg = await interaction.editReply({
      embeds: [embed], components: [getButtons(pageNo)], fetchReply: true,
    })

    const collector = interactionMsg.createMessageComponentCollector({
      time: 60000, componentType: 'BUTTON',
    })

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.member.user.id) return

      if (i.customId === 'next') {
        pageNo++
      } else if (i.customId === 'prev') {
        pageNo--
      } else {
        collector.stop()
        return i.update({
          content: 'Successfully quit the help menu.', embeds: [], components: [],
        })
      }

      const category = helpArray[pageNo - 1]

      embed.fields = []
      embed
        .setDescription(`**${category.name}**`)
        .addFields(category.commands.map(({ name, description }) => {
          return {
            name: `\`${name}\``, value: `${description}`, inline: true,
          }
        }))
        .setFooter({ text: `Page ${pageNo}/${helpArray.length} | "Do /help command name" for more information about a specific command` })

      return i.update({
        embeds: [embed], components: [getButtons(pageNo)], fetchReply: true,
      })
    })
  },
}
