const fs = require('fs')
require('dotenv').config()
const { admin, server } = require('./server')
const { Logger } = require('./tools')


const validateEnv = (env) => {
  const errors = []
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
  if (env.FIREBASE_SERVICE_ACCOUNT_JSON && !fs.existsSync(env.FIREBASE_SERVICE_ACCOUNT_JSON)) {
    errors.push('firebase service account file not found')
  }
  if (env.HUAWEI_CONFIG_JSON && !fs.existsSync(env.HUAWEI_CONFIG_JSON)) {
    errors.push('huawei config file not found')
  }
  if (emptyVars.length) {
    const message = emptyVars.map(name => `env.${name}`).join(', ') + ' must be specified'
    errors.push(message)
  }
  if (errors.length) {
    throw new Error(errors.join(', '))
  }
}

validateEnv(process.env)

const port = +process.env.PORT

const readFileJson = (file) => {
  // const text = fs.readFileSync(path.join(__dirname, file), 'utf-8')
  const text = fs.readFileSync(file, 'utf-8')
  return JSON.parse(text)
}
const firebaseConfig = process.env.FIREBASE_SERVICE_ACCOUNT_JSON ? {
  credential: require('firebase-admin')
    .credential
    .cert(readFileJson(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)),
} : null;
const huaweiConfig = process.env.HUAWEI_CONFIG_JSON ? {
  retryConfig: {
    maxDelayInMillis: 1000,
    maxRetries: 0,
    backOffFactor: 0.5,
    statusCodes: [503],
    ioErrorCodes: ['ETIMEDOUT']
  },
  authTimeout: 5 * 1000,
  messagingTimeout: 5 * 1000,
  ...readFileJson(process.env.HUAWEI_CONFIG_JSON),
} : null;
if (firebaseConfig) {
  admin.initializeFirebase(firebaseConfig)
}
if (huaweiConfig) {
  admin.initializeHuawei(huaweiConfig)
}

const logger = new Logger('main')
server.on('error', (e) => {
  logger.error(e)
})

server.listen(port, '0.0.0.0', () => logger.log('server listening port', server.address().port))
