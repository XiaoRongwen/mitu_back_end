const express = require('express')
const router = express.Router()
var mysql = require('mysql')
const dbConfig = require('../utils/dbConfig')
var connection = mysql.createConnection(dbConfig)
//保存页面
router.post('/save_page', function (req, res, next) {
    const {
        background_primary,
        mask_layer,
        video,
        audio,
        hands_img,
        hands_img_x,
        hands_img_y,
        nums_opacity,
        ifream_info,
        input_position,
    } = req.body
    const mask_layer_string = JSON.stringify(mask_layer)
    const audio_string = JSON.stringify(audio)
    const video_string = JSON.stringify(video)
    const ifream_info_string = JSON.stringify(ifream_info)
    const input_position_string = JSON.stringify(input_position)
    const query = `INSERT INTO page_list (background_primary, mask_layer, audio, hands_img ,hands_img_x, hands_img_y,video,nums_opacity,input_position,ifream_info) VALUES 
    ('${background_primary}', '${mask_layer_string}', '${audio_string}', '${hands_img}', '${hands_img_x}', '${hands_img_y}','${video_string}','${nums_opacity}','${ifream_info_string}','${input_position_string}')`

    connection.query(query, function (error, results, fields) {
        if (error) throw error
        res.send('Data inserted successfully')
    })
})
//修改页面
router.post('/edit_page/:id', function (req, res, next) {
    const {
        background_primary,
        mask_layer,
        audio,
        video,
        hands_img,
        hands_img_x,
        hands_img_y,
        nums_opacity,
        ifream_info,
        input_position,
    } = req.body
    const mask_layer_string = JSON.stringify(mask_layer)
    const audio_string = JSON.stringify(audio)
    const video_string = JSON.stringify(video)
    const ifream_info_string = JSON.stringify(ifream_info)
    const input_position_string = JSON.stringify(input_position)
    const id = req.params.id
    const query = `UPDATE page_list SET background_primary = '${background_primary}', mask_layer = '${mask_layer_string}', 
    audio = '${audio_string}', hands_img = '${hands_img}', hands_img_x = '${hands_img_x}', hands_img_y = '${hands_img_y}',
    video='${video_string}',nums_opacity='${nums_opacity}',ifream_info='${ifream_info_string}'  ,input_position='${input_position_string}' WHERE id = ${id}`

    connection.query(query, function (error, results, fields) {
        if (error) throw error
        res.send('Data updated successfully')
    })
})

// 页面渲染
router.get('/get_page/:id', function (req, res, next) {
    const id = req.params.id
    const query = `SELECT * FROM page_list WHERE id = ${connection.escape(id)}`

    connection.query(query, function (error, results, fields) {
        if (results.length > 0) {
            results[0].mask_layer = JSON.parse(results[0].mask_layer)
            results[0].audio = JSON.parse(results[0].audio)
            results[0].video = JSON.parse(results[0].video)
            results[0].input_position = JSON.parse(results[0].input_position)
            results[0].ifream_info = JSON.parse(results[0].ifream_info)
        }
        if (error) throw error
        res.send(results[0])
    })
})
// 删除
router.post('/delete_page/:id', function (req, res, next) {
    const id = req.params.id
    console.log(id)
    const query = `DELETE FROM page_list WHERE id = ${connection.escape(id)}`
    connection.query(query, function (error, results, fields) {
        if (error) throw error
        res.send('Data deleted successfully')
    })
})
// 列表
router.get('/get_page_list', function (req, res) {
    let page = req.query.page ? parseInt(req.query.page) : 1 // 默认页码为 1
    let limit = req.query.limit ? parseInt(req.query.limit) : 30 // 默认每页数量为 10
    let offset = (page - 1) * limit

    // 查询页面列表
    let queryPages = `SELECT * FROM page_list LIMIT ${limit} OFFSET ${offset}`
    connection.query(queryPages, function (error, results, fields) {
        if (error) {
            res.status(500).json({ error: error.toString() })
            return
        }
        results.forEach((result) => {
            result.audio = JSON.parse(result.audio)
            result.mask_layer = JSON.parse(result.mask_layer)
            result.video = JSON.parse(result.video)
            result.input_position = JSON.parse(result.input_position)
            result.ifream_info = JSON.parse(result.ifream_info)
        })
        // 查询总数
        let queryTotal = 'SELECT COUNT(*) as total FROM page_list'
        connection.query(queryTotal, function (error, totalResults, fields) {
            if (error) {
                res.status(500).json({ error: error.toString() })
                return
            }

            res.json({
                total: totalResults[0].total,
                pages: results,
                currentPage: page,
                perPage: limit,
            })
        })
    })
})
module.exports = router
