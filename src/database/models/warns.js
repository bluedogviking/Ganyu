import mongoose from 'mongoose'

const WarnsSchema = new mongoose.Schema({
  memberID: String,
  warnings: Map,
})

export default mongoose.model('warns', WarnsSchema)
