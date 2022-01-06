import mongoose from 'mongoose'

const CustomRolesSchema = new mongoose.Schema({
  memberID: String,
  roleID: String,
})

export default mongoose.model('customRoles', CustomRolesSchema)
