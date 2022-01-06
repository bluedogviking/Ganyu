import mongoose from 'mongoose'

const HiatusSchema = new mongoose.Schema({
  memberID: String,
  roles: Map,
})

export default mongoose.model('hiatus', HiatusSchema)
