const http = require('http')
require('dotenv').config()
const express = require('express')
const { MysignalAdmin } = require('mysignal')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('../msg-docs.json')
const { loggerMw } = require('./logger.mw')
const { basicAuthMw } = require('./basic-auth.mw')
const { toBoolean } = require('./tools')

const admin = new MysignalAdmin();

const USER = {
  name: process.env.AUTH_USER,
  pass: process.env.AUTH_PASS,
}
const app = express()

app.use(loggerMw)
app.use(basicAuthMw([{ name: USER.name, pass: USER.pass }]))
app.use(express.json({ limit: '1Mb' }))

app.use('/docs', swaggerUi.serve)
app.get('/docs', swaggerUi.setup(swaggerDocument))

app.post('/api/subscribe', async (req, res) => {
  const { topic, tokens } = req.body;
  const result = await admin.messaging().subscribeToTopic(tokens, topic)
  res.json(result)
})
app.post('/api/unsubscribe', async (req, res) => {
  const { topic, tokens } = req.body;
  const result = await admin.messaging().unsubscribeFromTopic(tokens, topic)
  res.json(result)
})
app.post('/api/send', async (req, res) => {
  const { message } = req.body;
  const dryRun = toBoolean(req.query.dry_run);
  const result = await admin.messaging().send(message, dryRun)
  res.json(result)
})
app.post('/api/send-each', async (req, res) => {
  const { tokens, message } = req.body;
  const dryRun = toBoolean(req.query.dry_run);
  const result = await admin.messaging().sendEach(tokens, message, dryRun)
  res.json(result)
})

const server = http.createServer(app)

module.exports = { server, admin }
