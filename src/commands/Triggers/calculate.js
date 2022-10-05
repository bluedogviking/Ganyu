import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'

export default {
	directory: 'Triggers',
	usage: 'Go Figure',
	requirements: 'Members',

	data: new SlashCommandBuilder()
		.setName('calculate')
		.setDescription('Triggers a trigger.')
		.addSubcommand(freeze => freeze
			.setName('freeze')
			.setDescription('Calculation for freeze comp.')
			.addNumberOption(atk => atk
				.setName('attack')
				.setDescription('Attack value')
				.setRequired(true))
			.addNumberOption(cr => cr
				.setName('crit-rate')
				.setDescription('Crit Rate value')
				.setRequired(true))
			.addNumberOption(cd => cd
				.setName('crit-damage')
				.setDescription('Crit Damage value')
				.setRequired(true)),
		)
		.addSubcommand(melt => melt
			.setName('melt')
			.setDescription('Calculation for melt comp.')
			.addNumberOption(atk => atk
				.setName('attack')
				.setDescription('Attack value')
				.setRequired(true))
			.addNumberOption(cr => cr
				.setName('crit-rate')
				.setDescription('Crit Rate value')
				.setRequired(true))
			.addNumberOption(cd => cd
				.setName('crit-damage')
				.setDescription('Crit Damage value')
				.setRequired(true))
			.addNumberOption(em => em
				.setName('elemental-mastery')
				.setDescription('Elemental Mastery value')
				.setRequired(true)),
		),

	/** @param {CommandInteraction} interaction */
	execute: async function (interaction) {
		const comp = interaction.options.getSubcommand()
		const atk = interaction.options.getNumber('attack')
		const cr = interaction.options.getNumber('crit-rate')
		const cd = interaction.options.getNumber('crit-damage')

		switch (comp) {
			case 'freeze':
				const FREEZEeffectiveAttack = atk * (1 + (cr / 100 + 0.55) * cd / 100)
				await interaction.reply(`Your Effective Attack is: ${FREEZEeffectiveAttack}`)
				break
			case 'melt':
				const em = interaction.options.getNumber('elemental-mastery')
				const MELTeffectiveAttack = atk * (1 + (cr / 100 + 0.2) * cd / 100) * (1.5 + 2.78 * em / (1400 + em))
				await interaction.reply(`Your Effective Attack is: ${MELTeffectiveAttack}`)
				break
		}
	},
}
