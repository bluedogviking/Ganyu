import mongoose from 'mongoose'

const ModmailsSchema = new mongoose.Schema({
  memberID: String,
  channelID: String,
})

export default mongoose.model('modmails', ModmailsSchema)
