const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const router = require('./routes/index')

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const isProduction = process.env.NODE_ENV === 'production';
const origin = {
    origin: isProduction ? 'https://my-book-api.herokuapp.com' : '*',
};

app.use(cors(origin));
app.use(compression());
app.use(helmet());
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50, // 5 requests,
});

app.use(limiter);

app.use(router);


// Start server
app.listen(process.env.PORT || 3002, () => {
    console.log(`Server listening`);
    if (!isProduction) console.log('open: http://localhost:3002');
});