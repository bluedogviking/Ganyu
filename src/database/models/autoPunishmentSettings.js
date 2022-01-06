import mongoose from 'mongoose'

const AutoPunishmentSettings = new mongoose.Schema({
  warns: Number,
  punishment: String,
  duration: String,
})

export default mongoose.model('auto-punishment-settings', AutoPunishmentSettings)
