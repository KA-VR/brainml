'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _api = require('./routes/api');

var _api2 = _interopRequireDefault(_api);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.load();

var port = process.env.PORT || 7750;
var app = (0, _express2.default)();

app.use(_bodyParser2.default.urlencoded({ extended: false })).use(_bodyParser2.default.json()).use('/api', _api2.default);

app.listen(port, function () {
  // eslint-disable-next-line no-console
  console.log('Brain is listening on: ' + port + ' ');
});