const express = require('express')
const router = express.Router()
var mysql = require('mysql')
const dbConfig = require('../utils/dbConfig')
var connection = mysql.createConnection(dbConfig)
//保存页面
router.post('/save_question', function (req, res, next) {
    // 从请求体中获取数据
    const { key_id, title, question, ask, remarks, cover } = req.body

    // 创建 SQL 插入语句
    const sql = `INSERT INTO question_list (key_id, title, question, ask, cover, remarks) VALUES (?, ?, ?, ?, ?,?)`

    // 执行 SQL 插入操作
    connection.query(
        sql,
        [key_id, title, question, ask, cover, remarks],
        function (err, results) {
            if (err) {
                // 如果出错，传递错误到下一个中间件
                next(err)
                res.status(500).json({ error: err.toString() })
            } else {
                // 如果成功，返回插入的行的 ID
                res.send({ message: '操作成功！', code: 200 })
            }
        }
    )
})

router.post('/update_question', function (req, res, next) {
    const { key_id, title, question, ask, remarks, id, cover } = req.body
    const sql = `UPDATE question_list SET title = ?, question = ?, ask = ?, remarks = ? ,key_id = ? ,cover = ? WHERE id = ?`
    connection.query(
        sql,
        [title, question, ask, remarks, key_id, cover, id],
        function (err, results) {
            if (err) {
                next(err)
                res.status(500).json({ error: err.toString() })
            } else {
                res.send({ message: '更新成功！', code: 200 })
            }
        }
    )
})

router.get('/get_questions_list', function (req, res, next) {
    // 从查询参数中获取分页参数
    const { current = 1, pageSize = 20 } = req.query

    // 计算要跳过的记录数
    const offset = (current - 1) * pageSize

    // 创建 SQL 查询语句
    const sql = `SELECT * FROM question_list LIMIT ? OFFSET ?`
    const countSql = `SELECT COUNT(*) as total FROM question_list`

    // 执行 SQL 查询操作
    connection.query(
        sql,
        [parseInt(pageSize), parseInt(offset)],
        function (err, results) {
            if (err) {
                // 如果出错，传递错误到下一个中间件
                next(err)
                res.status(500).json({ error: err.toString() })
            } else {
                // 查询总数
                connection.query(countSql, function (err, countResults) {
                    if (err) {
                        next(err)
                        res.status(500).json({ error: err.toString() })
                    } else {
                        // 如果成功，返回查询结果和分页信息
                        res.json({
                            data: results,
                            page: parseInt(current),
                            success: true,
                            total: countResults[0].total,
                        })
                    }
                })
            }
        }
    )
})

router.get('/get_question_by_id', function (req, res, next) {
    // 从请求参数中获取ID
    const { id } = req.query
    console.log(id)
    // 创建 SQL 查询语句
    const sql = `SELECT question, key_id, ask FROM question_list WHERE id = ?`

    // 执行 SQL 查询操作
    connection.query(sql, [id], function (err, results) {
        if (err) {
            // 如果出错，传递错误到下一个中间件
            next(err)
            res.status(500).json({ error: err.toString() })
        } else {
            // 如果成功，返回查询结果
            res.json({
                data: results[0],
                success: true,
            })
        }
    })
})
router.post('/delete_question', function (req, res, next) {
    // 从请求体中获取 key_id
    const { id } = req.body

    // 创建 SQL 删除语句
    const sql = `DELETE FROM question_list WHERE id = ?`

    // 执行 SQL 删除操作
    connection.query(sql, [id], function (err, results) {
        if (err) {
            // 如果出错，传递错误到下一个中间件
            next(err)
            res.status(500).json({ error: err.toString() })
        } else {
            // 如果成功，返回删除的行的 ID
            res.send({ message: '删除成功！', code: 200 })
        }
    })
})

module.exports = router
