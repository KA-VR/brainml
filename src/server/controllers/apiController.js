/* eslint-disable no-console */
import apoc from 'apoc';

// const createSynonym = (verb, relation) => {
//   apoc.query('CREATE (n:Verb {name: "%verb%", usageRate: 1})', { verb }).exec()
//     .then(response => {
//       console.log(response);
//       // Todo need to find synonym for word used and relate it to action
//       // if synonym exists in api call then
//       apoc.query('MATCH (
          // n:Verb {name: "%verb%}),
          // (m:Verb {name: "%relation%"}) CREATE (n)-[:SYN {confidence: 0}]->(m)',
          // {verb, relation}).exec()
//         .then(response2 => {
//           console.log('Created relationship');
//         })
//         .catch(err => {
//           console.log('Error creating relationship: ', err);
//         });
//       // if synonym does not exist, send survey to user

//     })
//     .catch(err => {
//       console.log('Error creating synonym: ', err);
//     });
// };

const getTags = (callback) => {
  apoc.query('MATCH (n)-[r:OUTPUT]->(m) return r.tags').exec()
    .then(response => {
      console.log(response);
      callback(response[0].data.reduce((memo, dataobj) => memo.concat(dataobj.row[0]), []));
    })
    .catch(err => {
      console.log('Error retrieving tags: ', err);
    });
};

const determineRoute = (objects, callback) => {
  getTags((tags) => {
    console.log('tags are:', tags);
    console.log('objects are:', objects);
    let result = 'default';
    const fixedObjects = (objects instanceof Array) ? objects : [objects];
    fixedObjects.forEach((obj) => {
      console.log('obj is:', obj);
      if (tags.indexOf(obj) !== -1) {
        result = obj;
      }
    });
    callback(result);
  });
};

const getFunction = (req, res) => {
  console.log('In get Function', req.body);
  const verb = req.body.verb;
  const object = req.body['object[]'];

  determineRoute(object, (route) => {
    console.log('route selected is:', route);
    apoc.query(`MATCH (n:Verb {name:"%verb%"})-[:SYN*]->(m:Action)-[b:OUTPUT]->(r:Function)
      where any(x in b.tags where x = "%route%") return r`,
      { verb, route }).exec()
      .then(response => {
        console.log(response);
        if (response[0].data.length === 0) {
          console.log("ain't nothing in here....");
          // createSynonym() gets called here
        } else {
          const action = response[0].data[0].row[0];
          console.log(action);
          res.send(action);
        }
      })
      .catch(err => {
        console.log('errrrrrr', err);
      });
  });
};

export default { getFunction, getTags, determineRoute };
