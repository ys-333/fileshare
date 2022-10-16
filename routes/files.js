const Router = require('express').Router()
const multer = require('multer')
const path = require('path')
const File = require('../models/file')
const { v4: uuidv4 } = require('uuid')
const sendMail = require('../services/emailService')
const file = require('../models/file')
const emailTemplate = require('../services/emailTemplate')

// configuring multer

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 1000000 * 100 },
}).single('file')

// route handling upload of documents
Router.post('/', (req, res) => {
  // store file

  upload(req, res, async (err) => {
    // validate request
    if (!req.file) {
      return res.status(400).json({ error: 'All fields are mandatory' })
    }
    if (err) {
      return res.status(500).send({ error: err.message })
    }
    // store file database
    const file = new File({
      filename: req.file.filename,
      uuid: uuidv4(),
      path: req.file.path,
      size: req.file.size,
    })

    const response = await file.save()

    // send the url

    return res.json({
      file: `${process.env.APP_BASE_URL}/file/${response.uuid}`,
    })
  })
})

Router.post('/send', async (req, res) => {
  const { uuid, emailTo, emailFrom } = req.body
  try {
    const file = await File.findOne({ uuid: uuid })
    if (file.sender) {
      return res.status(422).send({ error: 'Email already sent at once' })
    }
    file.sender = emailFrom
    file.receive = emailTo

    const response = await file.save()
    sendMail({
      from: emailFrom,
      to: emailTo,
      subject: 'inShare file sharing',
      text: `${emailFrom} shared a file with you.`,
      html: emailTemplate({
        emailFrom,
        downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email`,
        size: parseInt(file.size / 1000) + 'KB',
        expires: '24 hours',
      }),
    }).then(() => {
      return res.json({ succes: true })
    })
  } catch (err) {
    return res.status(500).send({ error: 'Something went wrong.' })
  }
})

module.exports = Router
