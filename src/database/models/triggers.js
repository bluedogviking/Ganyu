import mongoose from 'mongoose'

const TriggersSchema = new mongoose.Schema({
  trigger: String,
  author: String,
  isEmbed: Boolean,
  response: String,
  json: String,
  date: String,
})

export default mongoose.model('triggers', TriggersSchema)
