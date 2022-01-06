import mongoose from 'mongoose'

const MutesSchema = new mongoose.Schema({
  memberID: String,
  unmuteAt: Number,
})

export default mongoose.model('mutes', MutesSchema)
