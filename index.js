process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const {createReadStream} = require('fs')
const { join } = require('path')
const {EventEmitter} = require('events')
const express = require('express')

const app = express()
const chatEmitter = new EventEmitter()
process.env.NODE_ENV.toLowerCase() !== 'production' && app.use(require('morgan')('dev'))

app.set('PORT', process.env.PORT || 4000)

app.use(express.urlencoded({ extended: false }))
app.use(express.static(join(__dirname + '/public')))
app.use(express.static(join(__dirname + '/node_modules/bootstrap/dist/css/')))

app.get('/', (req, res, next) => {
  const page = createReadStream(join(__dirname, 'public', 'index.html'))
  page.on('error', (err)=> next(err)).pipe(res)
})

app.get('/sse', (req, res) => {
  res.writeHead(200, {
    'content-type': 'text/event-stream',
    'connection': 'keep-alive'
  })


  const onMessage = message => {
    console.log('onMessage >> ', `data: ${message}`)
    res.write(`data: ${message}`)
  }

  chatEmitter.on('message', onMessage)
  chatEmitter.emit('message', 'Hello client')

  res.on('close', () => {
    chatEmitter.off('message', onMessage)
  })
})


// Receving messages from cleint
app.get('/chat', (req, res) => {
  const { message } = req.query
  chatEmitter.emit('message', message)
  res.end()
})

// Not found route
app.use('/*', (req, res) => {
  res.status(404).json({success:false, status: 404, message: 'Not Found'})
})

// Error handler
app.use((err, req, res, next) => {
  console.log(err)
  res.status(500).send('Internal Server Error')
})

// Runs app as standalone
if (require.main === module) {
  app.listen(app.get('PORT'), () => {
    console.log('App listening on port ', app.get('PORT'))
  })
} else {
  module.exports = app
}