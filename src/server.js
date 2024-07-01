const fs = require('fs')
const path = require('path')
const http = require('http')
require('dotenv').config()
const auth = require('basic-auth')
const express = require('express')
const { MysignalAdmin } = require('mysignal')
const { performance } = require('perf_hooks')

const validateEnv = (env) => {
  const emptyVars = []
  if (!env.PORT) {
    emptyVars.push('PORT')
  }
  if (!env.AUTH_USER) {
    emptyVars.push('AUTH_USER')
  }
  if (!env.AUTH_PASS) {
    emptyVars.push('AUTH_PASS')
  }
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    emptyVars.push('FIREBASE_SERVICE_ACCOUNT_JSON')
  }
  if (!env.HUAWEI_CONFIG_JSON) {
    emptyVars.push('HUAWEI_CONFIG_JSON')
  }
  if (emptyVars.length) {
    const message = emptyVars.map(name => `env.${name}`).join(', ') + ' must be specified'
    throw new Error(message)
  }
}

validateEnv(process.env)

const admin = new MysignalAdmin();
const readFileJson = (file) => {
  // const text = fs.readFileSync(path.join(__dirname, file), 'utf-8')
  const text = fs.readFileSync(file, 'utf-8')
  return JSON.parse(text)
}
admin.initializeApp({
  firebase: {
    credential: require('firebase-admin')
      .credential
      .cert(readFileJson(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)),
  },
  huawei: readFileJson(process.env.HUAWEI_CONFIG_JSON),
})

const port = +process.env.PORT
const USER = {
  name: process.env.AUTH_USER,
  pass: process.env.AUTH_PASS,
}
const app = express()

app.use((req, res, next) => {
  const start = performance.now();
  const { method, url, headers } = req;
  const ua = headers['user-agent']
  let bytes = 0
  const write = res.write
  res.write = (chunk, ...args) => {
    bytes += chunk.byteLength || chunk.length
    return write.call(res, chunk, ...args)
  }
  const end = res.end;
  res.end = (chunk, ...args) => {
    if (chunk) {
      bytes += chunk.byteLength || chunk.length
    }
    return end.call(res, chunk, ...args)
  }
  res.on('finish', () => {
    const duration = (performance.now() - start).toFixed(3);
    console.log('[HTTP]', method, url, res.statusCode, `${bytes}B`, '-', ua, `+${duration}ms`)
  })
  next()
})
app.use((req, res, next) => {
  const user = auth(req)
  if (user && user.name === USER.name && user.pass === USER.pass) {
    next();
    return;
  }
  const realm = 'Unauthorized'
  res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
  res.statusCode = 401;
  res.end()
})
app.use(express.json({ limit: '1Mb' }))

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
app.post('/api/send-to-topic', async (req, res) => {
  const { topic, message, dryRun } = req.body;
  const result = await admin.messaging().sendToTopic(topic, message, dryRun)
  res.json(result)
})
app.post('/api/send', async (req, res) => {
  const { message, dryRun } = req.body;
  const result = await admin.messaging().send(message, dryRun)
  res.json(result)
})
app.post('/api/send-each', async (req, res) => {
  const { tokens, message, dryRun } = req.body;
  const result = await admin.messaging().sendEach(tokens, message, dryRun)
  res.json(result)
})

const server = http.createServer(app)

server.listen(port, 'localhost', () => console.log('server listening port', server.address().port))
