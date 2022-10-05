import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageAttachment } from 'discord.js'
import EmoteCredits from '../../database/models/emoteCredits.js'

export default {
	directory: 'Server',
	usage: `Go Figure`,
	requirements: 'Administration',
	perms: 1n << 3n,

	data: new SlashCommandBuilder()
		.setName('credits')
		.setDescription('Manager for emotes in the server.')
		.addSubcommand(add => add
			.setName('add')
			.setDescription('Add an emote to the credits.')
			.addStringOption(author => author
				.setName('author')
				.setDescription('Author of the emote.')
				.setRequired(true))
			.addStringOption(emote => emote
				.setName('emote')
				.setDescription('The emote in raw format.')
				.setRequired(true))
			.addStringOption(socials => socials
				.setName('socials')
				.setDescription('Any social media links of the author.')))
		.addSubcommand(del => del
			.setName('delete')
			.setDescription('Delete an emote from the credits.')
			.addStringOption(emote => emote
				.setName('emote')
				.setDescription('The emote in raw format.')
				.setRequired(true)))
		.addSubcommand(view => view
			.setName('view')
			.setDescription('Inspect an emote from the database.')
			.addStringOption(emote => emote
				.setName('emote')
				.setDescription('The emote in raw format.')
				.setRequired(true)))
		.addSubcommand(list => list
			.setName('list')
			.setDescription('List all the emotes in the database.')),

	/**
	 * @param {CommandInteraction} interaction
	 * @param {String} author
	 * @param {String} emote
	 * @param {String} socials
	 * @returns {Promise<void>}
	 */
	add: async function (interaction, author, emote, socials) {
		EmoteCredits.findOne({ emote: emote }, {}, {}, async (err, data) => {
			if (err) throw err
			if (data)
				return interaction.reply({ content: `This emote is already in the database.` })
			await EmoteCredits.create({
				author,
				emote,
				socials,
			}).then(data => {
				return interaction.reply({ content: `Added ${data.emote} to the database.` })
			})
		})
	},

	/**
	 * @param {CommandInteraction} interaction
	 * @param {String} emote
	 * @returns {Promise<void>}
	 */
	delete: async function (interaction, emote) {
		EmoteCredits.findOne({ emote: emote }, {}, {}, (err, data) => {
			if (err) throw err
			if (!data)
				return interaction.reply({ content: `This emote was not credited.` })
			data.delete()
			return interaction.reply({ content: `Deleted ${emote} from the database.` })
		})
	},

	/**
	 * @param {CommandInteraction} interaction
	 * @param {String} emote
	 * @returns {Promise<void>}
	 */
	view: async function (interaction, emote) {
		EmoteCredits.findOne({ emote: emote }, {}, {}, (err, data) => {
			if (err) throw err
			if (!data)
				return interaction.reply({ content: `This emote was not credited.` })
			return interaction.reply({
				embeds: [{
					color: 'RANDOM',
					description: `**Author**: ${data.author}\n**Socials**: ${data.socials}\n**Emote**: ${data.emote}`,
				}],
			})
		})
	},

	/**
	 * @param {CommandInteraction} interaction
	 */
	list: function (interaction) {
		EmoteCredits.find((err, data) => {
			if (err) throw err
			if (data.length === 0)
				return interaction.reply({ content: `There are no credits in the database, yet.` })
			return interaction.reply({
				files: [
					new MessageAttachment(Buffer.from(data.map(value => {
						return `# Emote\n- ${value['emote']}\n`
					}).sort().join('\n')), 'Emotes.md'),
				],
			})
		})
	},

	/** @param {CommandInteraction} interaction */
	execute: async function (interaction) {
		let cmd = interaction.options.getSubcommand()

		switch (cmd) {
			case 'add':
				const author = interaction.options.getString('author')
				const addEmote = interaction.options.getString('emote')
				const socials = interaction.options.getString('socials') ?? 'N/A'

				await this.add(interaction, author, addEmote, socials)
				break
			case 'delete':
				const delEmote = interaction.options.getString('emote')
				await this.delete(interaction, delEmote)
				break
			case 'view':
				const viewEmote = interaction.options.getString('emote')
				await this.view(interaction, viewEmote)
				break
			case 'list':
				this.list(interaction)
				break
		}
	},
}
