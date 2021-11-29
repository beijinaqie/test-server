const path = require('path')
const http = require('http')
const ip = require('ip')
const chalk = require('chalk')
const { createReadStream } = require('fs')
const fs = require('fs')
const ejs = require('ejs')
// const ora = require('ora')

class Server {
  constructor(options) {
    console.log(options);
    this.port = options.port
    this.showHideFile = options.showHideFile
    this.directory = path.resolve(process.cwd(), options.directory)
    this.init()
  }

  init() {
    this.createServer()
  }
  sendFile(req, res, directory) {
    return createReadStream(directory).pipe(res)
  }
  sendDir(req, res, directory) {
    const content = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8')
    let dirs = fs.readdirSync(directory)
    dirs = dirs.map(item => {
      return (!item.startsWith('.') || this.showHideFile) && {
        url: path.join(req.url, item),
        filename: item
      }
    })
    let html = ejs.render(content, { dirs })
    res.end(html)
  }
  createServer() {
    const server = http.createServer((req, res) => {
      // ora.start()
      if (req.url == '/favicon.ico') return
      let directory = path.join(this.directory, req.url == '/' ? '' : req.url)
      // console.log(directory);
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
      console.log('your server is running at:\n');
      console.log('  ' + chalk.green('http://' + ip.address() + ':' + this.port));
      console.log('  ' + chalk.green('http://127.0.0.1:'+ this.port));
    })
  }
}

module.exports = Server