const { check } = require('express-validator')
const rateLimit = require('express-rate-limit')
const express = require('express')
const router = express.Router();
const BooksController = require('./../controllers/books')

const booksController = new BooksController();
router.get('/books', booksController.getBooks);

const postLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10
});

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
    booksController.addBook
);

module.exports = router