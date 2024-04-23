var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var { verifyToken } = require('./utils/token_vertify')
var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var { expressjwt } = require('express-jwt')
var app = express()

app.use(logger('dev'))

app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ limit: '5mb', extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => verifyToken(req, res, next)) // 验证token
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')
    res.header('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS')
    if (req.method.toLowerCase() === 'options') {
        res.sendStatus(200)
    } else {
        next()
    }
})

app.use(
    expressjwt({
        secret: 'peach',
        algorithms: ['HS256'],
    }).unless({
        path: ['/register', '/login', '/users', { url: /^\/file\/.*/ }],
    })
)

app.use(function (err, req, res, next) {
    if (err.status === 401) {
        const data = { message: 'token失效' }
        res.status(401).send({ data })
    }
})
app.use('/users', usersRouter)
module.exports = app
