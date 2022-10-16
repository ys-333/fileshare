const Router = require('express').Router()

const File = require('../models/file')

Router.get('/:uuid', async (req, res) => {
  const file = await File.findOne({ uuid: req.params.uuid })

  if (!file) {
    return res.render('download', { error: 'Something went wrong!' })
  }

  const filepath = `${__dirname}/../${file.path}`

  res.download(filepath)
})

module.exports = Router
