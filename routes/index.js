const { validationResult, check } = require('express-validator')
const { pool } = require('./../config')
const rateLimit = require('express-rate-limit')
const express = require('express')
const router = express.Router();

const getBooks = (request, response) => {
    pool.query('SELECT * FROM books', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows)
    })
}

router.get('/books', getBooks);

const postLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10
});

const addBook = (request, response) => {
    const errors = validationResult(request)

    if (!errors.isEmpty()) {
        return response.status(422).json({ errors: errors.array() })
    }

    const { author, title } = request.body

    pool.query('INSERT INTO books (author, title) VALUES ($1, $2)', [author, title], error => {
        if (error) {
            throw error;
        }
        response.status(201).json({ status: 'success', message: 'Book added.' })
    })
};

router.post(
    '/books',
    [
        check('author')
            .not()
            .isEmpty().withMessage('author cannot be empty')
            .trim()
            .isLength({ min: 5, max: 255 }).withMessage('author cannot be smaller that 4'),
        check('title')
            .not()
            .isEmpty()
            .isLength({ min: 5, max: 255 })
            .trim(),
    ],
    postLimiter,
    addBook
);

module.exports = router 