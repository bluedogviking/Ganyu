import mongoose from 'mongoose'

const EmoteCreditsSchema = new mongoose.Schema({
	author: String,
	emote: String,
	socials: String
})

export default mongoose.model('emoteCredits', EmoteCreditsSchema)
