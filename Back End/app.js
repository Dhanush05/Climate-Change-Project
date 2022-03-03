const express = require('express');
const app = express();
const cors = require('cors');
const routes = require('./routes/index.js');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3002;

app.use(cors());
// app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', routes);
app.listen(port, () => console.log('server started on port', port));

module.exports = app;
