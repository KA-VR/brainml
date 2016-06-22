'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _apoc = require('apoc');

var _apoc2 = _interopRequireDefault(_apoc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.load();


console.log(process.env.NEO4J_HOST);

var createSynonym = function createSynonym(word, relation) {};

var getFunction = function getFunction(req, res) {
  console.log('In get Function');
  var verb = req.body.verb;
  var object = req.body.object;
  _apoc2.default.query('MATCH (n:Action {name:"%verb%"}) return n', { verb: verb }).exec().then(function (response) {
    console.log(response);
  }).catch(function (err) {
    console.log('errrrrrr', err);
  });
};

exports.default = { getFunction: getFunction };