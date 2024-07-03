const { performance } = require('perf_hooks');
const { Logger } = require('./tools');

const logger = new Logger('HTTP')
const loggerMw = (req, res, next) => {
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
    logger.log(method, url, res.statusCode, `${bytes}B`, '-', ua, `+${duration}ms`)
  })
  next()
}

module.exports = { loggerMw }