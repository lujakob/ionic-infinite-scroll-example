var express = require('express'),
    morgan  = require('morgan'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    routes = require('./routes');

var port = 3333;


var app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(routes);

app.listen(port, function (err) {
    console.log('Server is running on port ' + 3333);
});