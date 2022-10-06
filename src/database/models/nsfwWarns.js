import mongoose from 'mongoose'

const NSFWWarnsSchema = new mongoose.Schema({
	memberID: String,
	warnings: Map,
})

export default mongoose.model('nsfw-warns', NSFWWarnsSchema)
