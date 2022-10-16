const express = require('express')
const app = express()
const path = require('path')
const fileRoute = require('./routes/files')
const showRoute = require('./routes/show')
const downloadRoute = require('./routes/download')
const connectDB = require('./config/db')
const cors = require('cors')

// cors option

const corsOption = {
  origin: process.env.ALLOWED_CLIENTS.split(','),
}

app.use(cors(corsOption))

// to access static file like css

app.use(express.static('public'))

// template engine

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// to get jsons file in req.body

app.use(express.json())

// Routes

app.use('/api/files', fileRoute)
app.use('/files', showRoute)
app.use('/files/download', downloadRoute)

// database and server listenings
connectDB()
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Listening on portal ${PORT}`)
})
