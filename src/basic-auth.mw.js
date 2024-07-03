const auth = require('basic-auth')

/**
 * @param {Array<{ name: string; pass: string }>} params 
 * @returns 
 */
const basicAuthMw = (params) => (req, res, next) => {
  if (!params.length) {
    next();
    return;
  }
  const user = auth(req)
  if (user && params.some(p => user.name === p.name && user.pass === p.pass)) {
    next();
    return;
  }
  const realm = 'Unauthorized'
  res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
  res.statusCode = 401;
  res.end()
}

module.exports = { basicAuthMw }
