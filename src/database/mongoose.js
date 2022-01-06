import Mongoose from 'mongoose'
import zaq from 'zaq'

export default {
  connect: async function (url) {
    try {
      Mongoose.connect(url, () => {
        zaq.ok('Connected to the database.')
      })
    } catch (error) {
      zaq.err(`There was an error connecting to the database.\n${error}`)
    }
  },
}
