import mongoose from 'mongoose'

const NSFWMutesSchema = new mongoose.Schema({
	memberID: String,
	unmuteAt: Number,
})

export default mongoose.model('nsfw-mutes', NSFWMutesSchema)
