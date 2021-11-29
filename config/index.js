module.exports = {
  port: {
    opt: '-p, --port [p]',
    description: '端口号，默认9527',
    default: '9527',
    example: 'test-server -p 9527'
  },
  directory: {
    opt: '-d, --directory [d]',
    description: '文件地址',
    default: 'process.cwd()',
    example: 'test-server -d ~/demo.js'
  }
}