import { CommandInteraction } from 'discord.js'
import CustomRoles from '../database/models/customRoles.js'
import Roles from '../constants/roles.js'

export default {
	roles: {
		'nitroBoosterRole': '790760417265844236',
		'parentRole': '807040777120251904',
	},

	/** @param {CommandInteraction} interaction */
	create: async function (interaction) {
		const roleName = interaction.options.getString('role-name')
		const roleColor = interaction.options.getString('role-color')
		const roleIcon = interaction.options.getString('role-icon') ?? null

		const nitroBoosterRole = await interaction.guild.roles.fetch(this.roles.nitroBoosterRole).catch(() => {
			interaction.reply({ content: `Could not find the server booster role.` })
		})
		const isBoosting = interaction.member.roles.cache.has(nitroBoosterRole.id)
		const parentRole = await interaction.guild.roles.fetch(this.roles.parentRole).catch(() => {
			interaction.reply({ content: `Could not find the parent role for boosters. (Contact Zyla)` })
		})

		if (!isBoosting) {
			return await interaction.reply(
				'Only members who boosted the server can obtain a custom role.')
		}

		await interaction.guild.roles.create({
			color: roleColor,
			name: roleName,
			icon: roleIcon,
			position: parentRole.position - 1,
			reason: 'Custom Role',
		}).then(role => {
			CustomRoles.findOne({ memberID: interaction.member.user.id }, {}, {}, async (err, data) => {
				if (err) throw err
				if (!data) {
					await CustomRoles.create({
						memberID: interaction.member.user.id,
						roleID: role.id,
					})
					await interaction.member.roles.add(role.id)
					return interaction.reply('Your custom role is generated and granted, enjoy.')
				} else {
					await interaction.reply(`You already have a custom role, contact staff for help if you're stuck.`)
				}
			})
		}).catch((e) => {
			interaction.reply(`There was an error while creating your role, contact staff if you're stuck.\n${e.message}`)
		})
	},

	/** @param {CommandInteraction} interaction */
	change: async function (interaction) {
		const property = interaction.options.getString('property')
		const value = interaction.options.getString('value')

		if (!['name', 'color', 'colour', 'icon'].includes(property)) return await interaction.reply(
			'Please enter a valid property (name/color/icon)')

		CustomRoles.findOne({ memberID: interaction.member.user.id }, {}, {}, async (err, data) => {
			if (err) throw err
			if (!data) return interaction.reply({ content: `You don't even have a custom role let alone change its properties.` })

			const role = await interaction.guild.roles.fetch(data['roleID']).catch(() => {
				interaction.reply({ content: `I could not find the role.` })
			})

			switch (property) {
				case 'name':
					await interaction.guild.roles.edit(role, {
						name: value,
					}).then((role) => {
						return interaction.reply(`Your role name is now updated to \`${role.name}\``)
					}).catch((e) => {
						return interaction.reply(`There was an error trying to update your role, contact staff if you're stuck.\n${e.message}`)
					})
					break
				case 'color':
					await interaction.guild.roles.edit(role, {
						color: value,
					}).then((role) => {
						return interaction.reply(`Your role color is now updated to \`${role.color}\``)
					}).catch((e) => {
						return interaction.reply(`There was an error trying to update your role, contact staff if you're stuck.\n${e.message}`)
					})
					break
				case 'icon':
					await interaction.guild.roles.edit(role, {
						icon: value,
					}).then(() => {
						return interaction.reply(`Your role icon is now updated.`)
					}).catch((e) => {
						return interaction.reply(`There was an error trying to update your role, contact staff if you're stuck.\n${e.message}`)
					})
					break
			}
		})
	},

	/** @param {CommandInteraction} interaction */
	delet: async function (interaction) {
		const user = interaction.options.getUser('member').id
		const member = await interaction.guild.members.fetch({ user })
			.catch(() => {
				interaction.reply({ content: `Couldn't find the member.` })
			})

		if (!interaction.member.roles.cache.has(Roles.admin))
			return await interaction.reply(`Only Admins can delete one's custom role.`)

		if (!member) return await interaction.reply({ content: `Could not find the member.` })

		CustomRoles.findOne({ memberID: member.id }, {}, {}, async (err, data) => {
			if (err) throw err
			if (!data) return interaction.reply(`${member.user.tag ?? member} does not have a custom role.`)
			const role = await interaction.guild.roles.fetch(data['roleID']).catch(() => {
			})
			await interaction.guild.roles.delete(role).then(async () => {
				data.delete()
				await member.send(`Your custom role has been deleted by ${interaction.member.user.tag}.`)
				return interaction.reply(`${member.user.tag ?? member}'s custom role has been deleted.`)
			}).catch((e) => {
				interaction.reply(`There was an error while deleting the role.\nError: ${e.message}`)
			})
		})
	},
}
