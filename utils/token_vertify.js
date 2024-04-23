const jwt = require('jsonwebtoken')
const signkey = 'peach'

// 设置token
const setToken = function (account, password) {
    const payload = { account, password }
    return new Promise((resolve, reject) => {
        const token = jwt.sign(payload, signkey, {
            expiresIn: '24h',
            algorithm: 'HS256',
        }) // 编码格式
        resolve(token)
    })
}
// 验证Token
const verToken = function (token) {
    return new Promise((resolve, reject) => {
        // 使用jwt.verify方法做验证
        // 三个参数 传回来的token，钥匙，回调函数，两个参数，error 表示错误，res 是解码之后的 Token 数据。
        const info = jwt.verify(token, signkey, (error, res) => {
            const data = {}
            if (error) {
                data.code = '401'
                data.obj = error
                console.log('jwt.verify验证出错！', error)
            } else {
                data.code = '200'
                data.obj = res
            }
            return data
        })
        resolve(info)
    })
}

exports.verifyToken = function (req, res, next) {
    const token = req.headers.Authorization
    if (token === undefined) {
        next()
    } else {
        verToken(token)
            .then((data) => {
                req.data = data
                next()
            })
            .catch((error) => {
                next()
            })
    }
}
