var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var { verifyToken } = require('./utils/token_vertify')
var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var douyinRouter = require('./routes/douyin')
var questionRouter = require('./routes/question')
var { expressjwt } = require('express-jwt')
var app = express()
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const extname = path.extname(file.originalname)
        filename = file.fieldname + '-' + Date.now() + extname
        cb(null, filename)
    },
})

const upload = multer({ storage: storage }).single('file')
app.use(logger('dev'))

app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ limit: '5mb', extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static('uploads'))

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
app.post('/uploads', upload, function (req, res, next) {
    try {
        if (!req.file) {
            throw new Error('文件上传失败')
        }
        res.send(`http://localhost:4000/uploads/${req.file.filename}`) // 将保存后的文件名称发送给客户端
    } catch (err) {
        next(err)
    }
})
app.use((req, res, next) => verifyToken(req, res, next)) // 验证token

app.use(
    expressjwt({
        secret: 'peach',
        algorithms: ['HS256'],
    }).unless({
        path: [
            '/register',
            '/login',
            '/users',
            '/uploads',
            { url: /^\/uploads\/.*/ },
            { url: /^\/douyin\/.*/ },
            { url: /^\/file\/.*/ },
            { url: /^\/question\/.*/ },
        ],
    })
)

app.use(function (err, req, res, next) {
    if (err.status === 401) {
        const data = { message: 'token失效' }
        res.status(401).send({ data })
    }
})
app.use('/users', usersRouter)
app.use('/douyin', douyinRouter)
app.use('/question', questionRouter)
module.exports = app
