const mongoose = require('mongoose')
require('dotenv').config()

const connectDb = () => {
  mongoose.connect(process.env.MONGO_CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  const connection = mongoose.connection

  try {
    connection.once('open', () => {
      console.log('Database connected.')
    })
  } catch (err) {
    console.log('Connection Failed')
  }
}

module.exports = connectDb
