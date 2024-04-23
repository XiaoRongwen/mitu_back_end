var mysql = require('mysql')
var connection = mysql.createConnection({
    host: 'localhost', //主机
    user: 'root', //用户名
    password: '54.niyejx', //密码
    database: 'ruoyi_vue_blog', //数据库
})

connection.connect()

connection.query('SELECT 1 + 1 AS solution', function (err, rows, fields) {
    if (err) throw err

    console.log('The solution is: ', rows[0].solution)
})

connection.end()
