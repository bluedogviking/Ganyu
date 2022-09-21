import { CommandInteraction } from 'discord.js'

import { SlashCommandBuilder } from '@discordjs/builders'

export default {
	directory: 'Basic Moderation',
	usage: `member role`,
	requirements: 'Manage Roles',
	perms: ['MANAGE_ROLES'],

	data: new SlashCommandBuilder()
		.setName('role')
		.setDescription('Assign/remove a role from a member.')
		.addSubcommand(add => add
			.setName('add')
			.setDescription('Add a role to a member.')
			.addUserOption(user => user
				.setName('member')
				.setDescription('Member to add the role')
				.setRequired(true))
			.addRoleOption(role => role
				.setName('role')
				.setDescription('The role to add')
				.setRequired(true))
		)
		.addSubcommand(remove => remove
			.setName('remove')
			.setDescription('Remove a role from a member.')
			.addUserOption(user => user
				.setName('member')
				.setDescription('Member to remove the role')
				.setRequired(true))
			.addRoleOption(role => role
				.setName('role')
				.setDescription('The role to remove')
				.setRequired(true))
		),

	/** @param {CommandInteraction} interaction */
	execute: async function (interaction) {
		const user = interaction.options.getUser('member').id
		const member = await interaction.guild.members.fetch({ user })
			.catch(() => {
				interaction.reply(`Invalid member.`)
			})
		const roleID = interaction.options.getRole('role').id
		const role = await interaction.guild.roles.fetch(roleID)
			.catch(() => {
				interaction.reply(`Invalid role.`)
			})

		if (role.position >= interaction.member.roles.highest.position)
			return await interaction.reply("You can't alter someone greater than you.")

		if (member.roles.cache.has(role.id)) {
			await member.roles.remove(role.id).then(member => {
				interaction.reply(`Removed **${role.name}** from **${member.user.tag}**.`)
			})
		} else {
			await member.roles.add(role.id).then(member => {
				interaction.reply(`Added **${role.name}** to **${member.user.tag}**`)
			})
		}
	}
}
