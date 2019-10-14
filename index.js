const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { pool } = require('./config')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const { validationResult, check } = require('express-validator')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
const isProduction = process.env.NODE_ENV === 'production'
const origin = {
    origin: isProduction ? 'https://my-book-api.herokuapp.com' : '*',
}

app.use(cors(origin))
app.use(compression())
app.use(helmet())
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // 5 requests,
})

app.use(limiter)

const getBooks = (request, response) => {
    pool.query('SELECT * FROM books', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const addBook = (request, response) => {
    const { author, title } = request.body

    pool.query('INSERT INTO books (author, title) VALUES ($1, $2)', [author, title], error => {
        if (error) {
            throw error
        }
        response.status(201).json({ status: 'success', message: 'Book added.' })
    })
}

app
    .route('/books')
    // GET endpoint
    .get(getBooks)
// POST endpoint
// .post(addBook)

const postLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 1
})

app.post(
    '/books',
    [
        check('author')
            .not()
            .isEmpty()
            .isLength({ min: 5, max: 255 })
            .trim(),
        check('title')
            .not()
            .isEmpty()
            .isLength({ min: 5, max: 255 })
            .trim(),
    ],
    postLimiter,
    (request, response) => {
        const errors = validationResult(request)

        if (!errors.isEmpty()) {
            return response.status(422).json({ errors: errors.array() })
        }

        const { author, title } = request.body

        pool.query('INSERT INTO books (author, title) VALUES ($1, $2)', [author, title], error => {
            if (error) {
                throw error
            }
            response.status(201).json({ status: 'success', message: 'Book added.' })
        })
    }
)

// Start server
app.listen(process.env.PORT || 3002, () => {
    console.log(`Server listening`)
})