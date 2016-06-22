'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _api = require('./routes/api');

var _api2 = _interopRequireDefault(_api);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var port = process.env.PORT || 7750;
var app = (0, _express2.default)();

app.use(_bodyParser2.default.urlencoded({ extended: false })).use(_bodyParser2.default.json()).use('/api', _api2.default);

app.listen(port, function () {
  console.log('Brain is listening on: ' + port + ' ');
});