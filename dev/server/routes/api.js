'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _apiController = require('../controllers/apiController');

var _apiController2 = _interopRequireDefault(_apiController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = new _express.Router();

router.route('/think').get(function (req, res) {
  return res.send('hi');
});
router.route('/think').post(_apiController2.default.getFunction);

exports.default = router;