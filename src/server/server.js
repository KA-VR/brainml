import express from 'express';
import bodyParser from 'body-parser';
import apiRoute from './routes/api';
import cors from 'cors';
// import env from 'node-env-file';

// env(__dirname + '/../../.env');

const port = process.env.PORT || 7750;
const app = express();

app
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .use(cors())
  .use('/api', apiRoute);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Brain is listening on: ${port} `);
});

// var apoc = require('apoc')
// var query = apoc.query('CREATE (n:User { name: "Georges" })')

// query.exec().then((result) => {
//   console.log(result);
// }, (fail) => {
//   console.log(fail);
// });
