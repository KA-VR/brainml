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

const determineContext = (action, callback) => {
  apoc.query('MATCH (n:Action {name:"%action%"})-[r:ON]->(m:Context) return m', {action}).exec()
    .then(response => {
      console.log(response);
      callback(response[0].data[0].row[0]);
    })
    .catch(err => {
      console.log('Error retrieving context: ', err);
    });
};

//Gets the keyword of the statement
const determineKeyword = (context, callback) => {
  apoc.query('MATCH (n:Context {name: "%context"})-[r:IDED]->(m:Keyword) return m', {context}).exec()
    .then(response => {
      console.log(response);
      let keyword = {name: "default"};
      if(response[0].data.length !== 0){
        keyword = response[0].data[0].row[0].name;
      }
      callback(keyword);
    })
    .catch(err => {
      console.log('Error retrieving keyword: ', err);
    });
};

const determineFunction = (action, keyword, callback) => {
  action = action.toUpperCase();
  console.log(action);
  console.log(keyword);
  apoc.query('MATCH (n:Keyword {name: "%keyword%"})-[r:%action%]-> (m:Function) return m', {keyword, action}).exec()
    .then(response => {
      console.log(response);
      let fn = response[0].data[0].row;
      callback(fn);
    })
};

const determineAction = (verb, callback) => {
  apoc.query(`MATCH (n:Verb {name:"%verb%"})-[:SYN*]->(m:Action) return m`, {verb}).exec()
    .then(response => {
      console.log(response);
      let action = 'nothing';
      if(response[0].data.length === 0){
        console.log('nothing is here.....');
      } else{
        action = response[0].data[0].row[0];
        console.log('Action is:', action);
      }
      callback(action);
    })
    .catch(err => {
      console.log('error here', err);
    });
}

const getFunction = (req, res) => {
  console.log('In get Function', req.body);
  const verb = req.body.verb;
  const object = req.body['object[]'];

  determineAction(verb, (action) => {
    //checks for if context connected to action exists 
    console.log('Action is:', action);
    determineContext(action.name, (context) =>{
      //checks if keyword connecting to context exists
      console.log('Context is:', context);
      determineKeyword(context.name, (keyword) => {
        //retrieves function
        console.log('Keyword is:', keyword);
        determineFunction(action.name, keyword.name, (fn) =>{
          console.log('Function is:', fn);
          res.send(fn);
        })
      });
    });
  });


  // determineRoute(object, (route) => {
  //   console.log('route selected is:', route);
  //   apoc.query(`MATCH (n:Verb {name:"%verb%"})-[:SYN*]->(m:Action)-[b:OUTPUT]->(r:Function)
  //     where any(x in b.tags where x = "%route%") return r`,
  //     { verb, route }).exec()
  //     .then(response => {
  //       console.log(response);
  //       if (response[0].data.length === 0) {
  //         console.log("ain't nothing in here....");
  //         // createSynonym() gets called here
  //       } else {
  //         const action = response[0].data[0].row[0];
  //         console.log(action);
  //         res.send(action);
  //       }
  //     })
  //     .catch(err => {
  //       console.log('errrrrrr', err);
  //     });
  // });
};

const createAction = (req, res) => {
  console.log('creating action node');
  const verb = req.body.verb;
  const object = req.body['object'];

  // Function Creation Query
  // apoc.query('MATCH (n:Native {name: "Function Constructor"}) return n').exec()
  //   .then(response => {
  //     let action = response[0].data[0].row[0].code;
  //     console.log( action);

  //     eval(action)(apoc, "Test", () => {
  //       console.log('yay');
  //       res.send('woot');
  //     });
  //   })
  
  // Action Creation Query
  // apoc.query('MATCH (n:Native {name: "Action Constructor"}) return n').exec()
  //   .then(response => {
  //     let action = response[0].data[0].row[0].code;
  //     console.log( action);

  //     eval(action)(apoc, "Test", () => {
  //       console.log('yay');
  //       res.send('woot');
  //     });
  //   })

  // Verb Creation Query
  // apoc.query('MATCH (n:Native {name: "Verb Constructor"}) return n').exec()
  //   .then(response => {
  //     let action = response[0].data[0].row[0].code;
  //     console.log( action);

  //     eval(action)(apoc, "Test", () => {
  //       console.log('yay');
  //       res.send('woot');
  //     });
  //   })

  // Syn Creation Query
  // apoc.query('MATCH (n:Native {name: "SYN Constructor"}) return n').exec()
  //   .then(response => {
  //     let action = response[0].data[0].row[0].code;
  //     console.log( action);

  //     eval(action)(apoc, "Test", "Test", "Action", () => {
  //       console.log('yay');
  //       res.send('woot');
  //     });
  //   })

  // Output Creation Query
  // apoc.query('MATCH (n:Native {name: "OUTPUT Constructor"}) return n').exec()
  //   .then(response => {
  //     let action = response[0].data[0].row[0].code;
  //     console.log( action);
  //     let arr = 'test1","default'
  //     console.log(arr);
  //     eval(action)(apoc, "Test", "Test", arr, () => {
  //       console.log('yay');
  //       res.send('woot');
  //     });
  //   })

}

export default { getFunction, createAction };
