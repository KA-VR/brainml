import dotenv from 'dotenv';
dotenv.load();
import apoc from 'apoc';

console.log(process.env.NEO4J_HOST);

const createSynonym = (word, relation) => {
  
};


const getFunction = (req, res) => {
  console.log('In get Function');
  const verb = req.body.verb;
  const object = req.body.object;
  apoc.query('MATCH (n:Action {name:"%verb%"}) return n', { verb }).exec()
    .then(response => {
      console.log(response);
    })
    .catch(err => {
      console.log('errrrrrr', err);
    });
};

export default { getFunction };
