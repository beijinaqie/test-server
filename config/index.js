module.exports = {
  port: {
    opt: '-p, --port [p]',
    description: '端口号，默认9527',
    default: '9527',
    example: 'test-server -p 9527'
  },
  directory: {
    opt: '-d, --directory [d]',
    description: '当前执行命令的目录为根目录',
    default: '',
    example: 'test-server -d demo.html'
  },
  showHideFile: {
    opt: '-s, --show-hide-file',
    description: '是否展示隐藏文件，默认不展示',
    default: false,
    example: 'test-server -s'
  }
}