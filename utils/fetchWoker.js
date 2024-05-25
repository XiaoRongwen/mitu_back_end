const axios = require('axios')
axios.default.defaults.timeout = 10000

var mysql = require('mysql')
const dbConfig = require('./dbConfig.js')
var connection = mysql.createConnection(dbConfig)

const cheerio = require('cheerio')

// 请求需求列表
const makeRequest = async () => {
    for (let i = 0; i < 3; i++) {
        // Try 3 times
        try {
            const response = await axios.get(
                'https://bbs.125.la/d/task/getList.html',
                {
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Cache-Control': 'max-age=0',
                        Connection: 'keep-alive',
                        'Upgrade-Insecure-Requests': '1',
                    },
                }
            )

            return response.data
        } catch (error) {
            console.error(`Attempt ${i + 1} failed with error: ${error}`)
            if (i < 2) {
                console.log('Retrying...')
            }
        }
    }
    console.error('All attempts failed.')
}
// 解析列表页
function parseHTML(htmlString) {
    const $ = cheerio.load(htmlString)
    const data = []

    $('.tasklist-b-list').each((index, element) => {
        const price =
            $(element).find('.text-price').text() ||
            $(element).find('[lay-tips]').attr('lay-tips') ||
            '需要报价'
        const link = $(element).find('.text-cut a').attr('href')
        const title = $(element).find('.text-cut a').text()
        const location = $(element).find('.layui-icon-location').next().text()

        data.push({
            price,
            link: `https://bbs.125.la${link}`,
            title,
            location,
        })
    })

    return data
}

// 解析详情页
async function getdetails(link) {
    const htmlString = await fetchHTML(link)
    const $ = cheerio.load(htmlString)
    const content = $('#content').html() || $('.editormd-html-preview').html()
    return content
}

// 请求详情页
async function fetchHTML(url) {
    const { data } = await axios.get(url, {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'max-age=0',
            Connection: 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        },
    })

    return data
}

async function fetchData() {
    const str = await makeRequest()
    const dataList = parseHTML(str.data)
    const result = await Promise.all(
        dataList.map(async (item) => {
            const details = await getdetails(item.link)
            item.details = details.replace(/\n/g, '').replace(/\s{2,}/g, ' ')
            return item
        })
    )
    return result
}

// 插入数据函数
async function insertData() {
    const data = await fetchData()
    let queries = []
    for (let item of data) {
        let { price, link, title, location, details } = item
        let type = '匠迹众包' // 默认type值

        // 首先检查链接是否已经存在
        let checkQuery = 'SELECT link FROM task_list WHERE link = ?'
        queries.push(
            new Promise((resolve, reject) => {
                connection.query(
                    checkQuery,
                    [link],
                    function (error, results, fields) {
                        if (error) reject(error)

                        // 如果链接不存在，那么插入数据
                        if (results.length === 0) {
                            let insertQuery =
                                'INSERT INTO task_list (price, link, title, location, details, type) VALUES (?, ?, ?, ?, ?, ?)'
                            let values = [
                                price,
                                link,
                                title,
                                location,
                                details,
                                type,
                            ]

                            connection.query(
                                insertQuery,
                                values,
                                function (error, results, fields) {
                                    if (error) reject(error)
                                    console.log(
                                        'Inserted ' +
                                            results.affectedRows +
                                            ' row(s).'
                                    )
                                    resolve()
                                }
                            )
                        } else {
                            console.log('Link already exists, skipping insert.')
                            resolve()
                        }
                    }
                )
            })
        )
    }
    await Promise.all(queries)
    process.exit()
}
insertData()
