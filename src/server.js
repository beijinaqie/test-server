const path = require('path')
const http = require('http')
const ip = require('ip')
const chalk = require('chalk')
const { createReadStream } = require('fs')
const fs = require('fs')
const ejs = require('ejs')
// const ora = require('ora')
const mime = require('mime')
const figlet = require('figlet')
const crypto = require('crypto')

class Server {
  constructor(options) {
    this.port = options.port
    this.showHideFile = options.showHideFile
    this.directory = path.resolve(process.cwd(), options.directory)
    this.init()
  }

  init() {
    this.createServer()
  }
  catch(req, res, directory) {
    let statObj = fs.statSync(directory)

    res.setHeader('Expires', new Date(Date.now() + 10 * 1000).toGMTString())
    // 强制缓存
    res.setHeader('Cache-Control', 'max-age=0')
    // 协商缓存
    let lastModified = statObj.ctime.toGMTString()
    let etag = crypto.createHash('md5').update(lastModified + statObj.size).digest('base64')
    console.log(etag);
    // res.setHeader('Last-Modified', lastModified)
    // let ifModifiedSince = req.headers['if-modified-since']
    let ifNoneMatch = req.headers['if-none-match']
    res.setHeader('Etag', etag)
    // if (lastModified === ifModifiedSince) return true
    if (ifNoneMatch === etag) return true

    return false
  }
  sendFile(req, res, directory) {
    if (this.catch(req, res, directory)) {
      res.statusCode = 304;
      return res.end()
    }
    res.setHeader('Content-Type', mime.getType(directory) + ';charset=utf-8')
    createReadStream(directory).pipe(res)
  }
  sendDir(req, res, directory) {
    const content = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf-8')
    let dirs = fs.readdirSync(directory)

    dirs = dirs.map(item => {
      let statObj = fs.statSync(directory + '/' + item)
      return (!item.startsWith('.') || this.showHideFile) && {
        url: path.join(req.url, item),
        filename: item,
        info: {
          lastModified: (statObj.ctime).toLocaleString(),
          isFile: statObj.isFile(), 
          size: (statObj.size) / 1024 + 'k'
        }
      }
    }).filter(Boolean)
    let html = ejs.render(content, { dirs })
    res.setHeader('Content-Type', 'text/html;charset=utf-8')
    res.end(html)
  }
  createServer() {
    const server = http.createServer((req, res) => {
      // ora.start()
      console.log(req.url);
      let directory = path.join(this.directory, req.url == '/' ? '' : req.url)

      if (req.url == '/favicon.ico') return

      console.log(directory);
      if (!fs.existsSync(directory)) {
        res.end('Not Found')
      } else if (fs.statSync(directory).isFile()) {
        this.sendFile(req, res, directory);
      } else {
        this.sendDir(req, res, directory)
      }
    })
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        server.listen(++this.port)
      }
    })
    server.listen(this.port, () => {
      console.log(chalk.yellow.italic(figlet.textSync('welcome to test server')));
      console.log('your server is running at:\n');
      console.log('  ' + chalk.green('http://' + ip.address() + ':' + this.port));
      console.log('  ' + chalk.green('http://127.0.0.1:'+ this.port));
      console.log('\n' + chalk.cyan.bold.italic('Hit CTRL-C to stop the server'))
    })
  }
}

module.exports = Server