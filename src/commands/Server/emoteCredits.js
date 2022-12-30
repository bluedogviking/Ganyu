import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import EmoteCredits from '../../database/models/emoteCredits.js'
import Roles from '../../constants/roles.js'

export default {
	directory: 'Server',
	usage: `Go Figure`,

	data: new SlashCommandBuilder()
		.setName('credits')
		.setDescription('Database for the emotes in the server.')
		.addSubcommand(register => register
			.setName('register')
			.setDescription('Register an artist to the database.')
			.addStringOption(artist => artist
				.setName('artist')
				.setDescription('Discord tag of the artist. (Name#tag)')
				.setRequired(true))
			.addStringOption(socials => socials
				.setName('socials')
				.setDescription('Any social media links of the artist.')))
		.addSubcommand(deleteArtist => deleteArtist
			.setName('delete-artist')
			.setDescription('Delet an artist from the database.')
			.addStringOption(artist => artist
				.setName('artist')
				.setDescription('The artist you want to delete.')
				.setRequired(true)))
		.addSubcommand(addEmote => addEmote
			.setName('add-emote')
			.setDescription('Add an emote to the artist\'s vault.')
			.addStringOption(artist => artist
				.setName('artist')
				.setDescription('Discord tag of the artist. (Name#tag)')
				.setRequired(true))
			.addStringOption(rawEmote => rawEmote
				.setName('emote')
				.setDescription('The emote in raw format.')
				.setRequired(true))
			.addStringOption(emoteURL => emoteURL
				.setName('emote-link')
				.setDescription('Right click on the emote and select copy link')
				.setRequired(true)))
		.addSubcommand(deleteEmote => deleteEmote
			.setName('delete-emote')
			.setDescription('Delet an emote from the artist\'s vault.')
			.addStringOption(artist => artist
				.setName('artist')
				.setDescription('Who\'s emote do you want to delete?')
				.setRequired(true))
			.addStringOption(emote => emote
				.setName('emote')
				.setDescription('Which emote?')
				.setRequired(true)))
		.addSubcommand(vault => vault
			.setName('vault')
			.setDescription('List the vault of given artist.')
			.addStringOption(artist => artist
				.setName('artist')
				.setDescription('The artist you want to see the vault of')
				.setRequired(true)))
		.addSubcommand(listArtists => listArtists
			.setName('list-artists')
			.setDescription('List of all credited artists.')),

	/**
	 * @param {CommandInteraction} interaction
	 * @param {String} artist
	 * @param {String} socials
	 * @returns {Promise<void>}
	 */
	register: async function (interaction, artist, socials) {
		EmoteCredits.findOne({ artist: artist }, {}, {}, async (err, data) => {
			if (err) throw err
			if (data) {
				data.artist = artist
				data.socials = socials
				data.emotes = new Map()
				data.save()
				await interaction.reply({ content: `**${data['artist']}** has been updated.` })
			} else {
				await EmoteCredits.create({
					artist: artist,
					socials: socials ? socials : 'N/A',
					emotes: new Map(),
				}).then(data => {
					return interaction.reply({ content: `Registered **${data['artist']}** to the database.` })
				})
			}
		})
	},

	/**
	 * @param {CommandInteraction} interaction
	 * @param {String} artist
	 * @returns {Promise<void>}
	 */
	deletArtist: async function (interaction, artist) {
		EmoteCredits.findOne({ artist: artist }, {}, {}, async (err, data) => {
			if (err) throw err
			if (!data)
				return await interaction.reply({ content: `Couldn't find the **${artist}** in the database.` })
			data.delete()
			await interaction.reply({ content: `**${artist}** has been deleted from the database.` })
		})
	},

	/**
	 * @param {CommandInteraction} interaction
	 * @param {String} artist
	 * @param {String} emote
	 * @param {String} emoteURL
	 * @returns {Promise<void>}
	 */
	addEmote: async function (interaction, artist, emote, emoteURL) {
		EmoteCredits.findOne({ artist }, {}, {}, async (err, data) => {
			if (err) throw err
			if (!data)
				return await interaction.reply({ content: `Please register the artist first.` })
			if (data.emotes.has(emote)) {
				data.emotes.set(`${emote}`, {
					emote,
					emoteURL: emoteURL,
				})
				data.save()
				return await interaction.reply({ content: `${emote} has been updated.` })
			}
			data.emotes.set(`${emote}`, {
				emoteURL: emoteURL,
			})
			await interaction.reply({ content: `Added ${emote} to **${artist}**'s vault.` })
			data.save()
		})
	},

	deleteEmote: async function (interaction, artist, emote) {
		EmoteCredits.findOne({ artist }, {}, {}, async (err, data) => {
			if (err) throw err
			if (!data)
				return await interaction.reply({ content: `**${artist}** is not registered.` })
			if (!data.emotes.has(`${emote}`))
				return await interaction.reply({ content: `**${artist}** does not have the given emote in their vault.` })
			data.emotes.delete(`${emote}`)
			data.save()
			return await interaction.reply({ content: `${emote} has been deleted from **${artist}**'s vault.` })
		})
	},

	/**
	 * @param {CommandInteraction} interaction
	 * @param {String} artist
	 * @returns {Promise<void>}
	 */
	vault: async function (interaction, artist) {
		EmoteCredits.findOne({ artist }, {}, {}, async (err, data) => {
			if (err) throw err
			if (!data)
				return await interaction.reply({ content: `**${artist}** is not registered.` })

			const fields = []
			for (const [key, value] of data.emotes.entries()) {
				fields.push({
					name: `${key}`,
					value: `Emote URL: ${value.emoteURL}`,
					inline: true,
				})
			}

			await interaction.reply({
				embeds: [
					new MessageEmbed({
						color: 'BLUE',
						title: `**${artist}**'s Emote Vault`,
						// description: 'Please clear out redundant warnings as Discord embeds have a limit of 6000 characters, this function may not work in the future with many warnings.',
						fields,
						timestamp: new Date(),
					}),
				],
			}).catch(() => {
				interaction.reply('Please ask Zyla for help.')
			})
		})
	},

	/**
	 * @param {CommandInteraction} interaction
	 * @returns {Promise<void>}
	 */
	listArtists: async function (interaction) {
		EmoteCredits.find(async (err, data) => {
			if (err) throw err
			if (!data)
				return await interaction.reply({ content: `There are no artists in the vault.` })

			const fields = []
			for (const [key, value] of data.entries()) {
				fields.push({
					name: `${value.artist}`,
					value: `${value.socials}`,
				})
			}

			await interaction.reply({
				embeds: [
					new MessageEmbed({
						color: 'BLUE',
						title: 'Here\'s the list of all credited artists.',
						fields,
						timestamp: new Date(),
					}),
				],
			}).catch(() => {
				interaction.reply('Please ask Zyla for help.')
			})
		})
	},

	/** @param {CommandInteraction} interaction */
	execute: async function (interaction) {
		if (!interaction.member.roles.cache.some(r => [
			Roles.admin,
			Roles.mod,
		].includes(r.id))) return interaction.reply(`Insufficient permissions.`)

		const cmd = interaction.options.getSubcommand()
		const artist = interaction.options.getString('artist')?.trim()
		const socials = interaction.options.getString('socials')?.trim()

		switch (cmd) {
			case 'register':
				await this.register(interaction, artist, socials?.trim())
				break
			case 'add-emote':
				const emote = interaction.options.getString('emote').trim()
				const emoteURL = interaction.options.getString('emote-link').trim()

				await this.addEmote(interaction, artist, emote, emoteURL)
				break
			case 'delete-emote':
				const emote2 = interaction.options.getString('emote').trim()

				await this.deleteEmote(interaction, artist, emote2)
				break
			case 'vault':
				await this.vault(interaction, artist)
				break
			case 'list-artists':
				await this.listArtists(interaction)
				break
			case 'delete-artist':
				await this.deletArtist(interaction, artist)
				break
		}
	},
}
