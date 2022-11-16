import mongoose from 'mongoose'

const EmoteCreditsSchema = new mongoose.Schema({
	artist: String,
	socials: String,
	emotes: Map,
})

export default mongoose.model('emoteCredits', EmoteCreditsSchema)
