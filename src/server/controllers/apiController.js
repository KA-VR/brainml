/* eslint-disable no-console */
import apoc from 'apoc';
import async from 'async';

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

// TODO: Handle context when array
const determineContext = (action, context, callback) => {
  const arr = typeof context === 'string' ? [context] : context;
  console.log('arr is:', arr);
  let results = [];
  async.each(arr, (obj, cb) => { 
    apoc.query('MATCH (n:Action {name:"%action%"})-[r:ON]->(m:Context {name: "%obj%"}) return m', {action, obj}).exec()
      .then(response => {
        console.log(response);
        if(response[0].data[0].length === 0){
          cb();
        } else{
          results.push(response[0].data[0].row[0].name);
          cb();
        }
      })
      .catch(err => {
        console.log('Error retrieving context: ', err);
      });
  }, (err) => {
    if(err){
      console.log('Error determining context: ', err);
    }
    console.log('Finished checking context for each context: ', results);
    callback(results);
  })
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

const getExactNode = (nodeName, nodeType, callback) => {
  apoc.query(`MATCH (n:%nodeType% {name: "%nodeName%"}) return n`, {nodeName, nodeType}).exec()
    .then(response => {
      console.log(response);
      if(response[0].data.length === 0){
        console.log('node is not here.....');
        callback('node is not here')
      } else {
        callback(response[0].data[0].row[0]);
      }
    });
}

// from verb determine action:
const determineAction = (verb, synonyms, callback) => {
  console.log('the synonyms are: ', synonyms);
  apoc.query(`MATCH (n:Verb {name:"%verb%"})-[:SYN*]->(m:Action) return m`, {verb}).exec()
    .then(response => {
      console.log(response);
      let action = 'nothing';
      if(response[0].data.length === 0){
        console.log('nothing is here.....');
        // Gets all existing verb nodes
        getAllVerbNodes((verbs) => {
          // iterate over all existing verb nodes
          console.log('the verbs are:', verbs);
          for(var i = 0; i < verbs.length; i++){
            console.log('count is:', i);
            console.log('current verb is:', verbs[i]);
            // if synonyms of unknown verb matches an existing verb
            if(synonyms.indexOf(verbs[i]) > -1){
              let syn = verbs[i];
              console.log('found a match!')
              //create a verb node with the unknown verb
              createVerbNode(verb, () => {
                console.log('created new verb node!');
                //create a new syn relationship between that new verb node and the existing synonym verb node
                createSYNRel(verb, syn, "Verb", () => {
                  console.log('created SYN relationship!');
                  apoc.query(`MATCH (n:Verb {name:"%verb%"})-[:SYN*]->(m:Verb {name:"%syn%"}) return m`, {verb, syn}).exec()
                    .then(response2 => {
                      action = response2[0].data[0].row[0];
                      console.log('Action is:', action);
                      callback(action);
                    });
                });
              });
            } else {
              console.log('didnt match!');
            }
          }
          // if synonym not found get all actions as ask user what they mean
        });
      } else{
        action = response[0].data[0].row[0];
        console.log('Action is:', action);
        callback(action);
      }
    })
    .catch(err => {
      console.log('error here', err);
    });
}

const getFunction = (req, res) => {
  console.log('In get Function', req.body);
  const verb = req.body.verb;
  const object = req.body['object[]'];
  const synonyms = req.body['synonyms[]'];
  console.log('Object is:', object);
  console.log('synonyms are:', synonyms);
  determineAction(verb, synonyms, (action) => {
    //checks for if context connected to action exists 
    console.log('Action is:', action);
    determineContext(action.name, object, (context) =>{
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
};

const createFunctionNode = (functionName, callback) => {
  apoc.query('MATCH (n:Native {name: "Function Constructor"}) return n').exec()
    .then(response => {
      let action = response[0].data[0].row[0].code;
      console.log( action);

      eval(action)(apoc, functionName, () => {
        console.log('yay');
        callback();
      });
    });
}

const createActionNode = (actionName, callback) => {
  apoc.query('MATCH (n:Native {name: "Action Constructor"}) return n').exec()
    .then(response => {
      let action = response[0].data[0].row[0].code;
      console.log( action);

      eval(action)(apoc, actionName, () => {
        console.log('yay');
        callback();
      });
    });
}

const createVerbNode = (verbName, callback) => {
  apoc.query('MATCH (n:Native {name: "Verb Constructor"}) return n').exec()
    .then(response => {
      let action = response[0].data[0].row[0].code;
      console.log( action);

      eval(action)(apoc, verbName, () => {
        console.log('yay');
        callback();
      });
    });
}

const createContextNode = (contextName, callback) => {
  apoc.query('MATCH (n:Native {name: "Context Constructor"}) return n').exec()
  .then(response => {
    let action = response[0].data[0].row[0].code;
    console.log( action);

    eval(action)(apoc, contextName, () => {
      console.log('yay');
      callback();
    });
  });
}

const createKeywordNode = (keywordName, callback) => {
  apoc.query('MATCH (n:Native {name: "Keyword Constructor"}) return n').exec()
   .then(response => {
     let action = response[0].data[0].row[0].code;
     console.log( action);

     eval(action)(apoc, "Test", () => {
       console.log('yay');
       callback();
     });
   });
}

const createSYNRel = (verbName, nodeName, nodeType, callback) => {
  apoc.query('MATCH (n:Native {name: "SYN Constructor"}) return n').exec()
    .then(response => {
      let action = response[0].data[0].row[0].code;
      console.log( action);

      eval(action)(apoc, verbName, nodeName, nodeType, () => {
        console.log('yay');
        callback();
      });
    });
}

const createONRel = (actionName, contextName, callback) => {
  apoc.query('MATCH (n:Native {name: "ON Constructor"}) return n').exec()
    .then(response => {
      let action = response[0].data[0].row[0].code;
      console.log( action);

      eval(action)(apoc, actionName, contextName, () => {
        console.log('yay');
        callback();
      });
    });
}

const createIDEDRel = (contextName, keywordName, callback) => {
  apoc.query('MATCH (n:Native {name: "IDED Constructor"}) return n').exec()
    .then(response => {
      let action = response[0].data[0].row[0].code;
      console.log( action);

      eval(action)(apoc, contextName, keywordName, () => {
        console.log('yay');
        callback();
      });
    });
}

const createOUTPUTRel = (keywordName, functionName, actionName, callback) => {
  const relName = actionName.toUpperCase();
  apoc.query('MATCH (n:Native {name: "OUTPUT Constructor"}) return n').exec()
    .then(response => {
      let action = response[0].data[0].row[0].code;
      console.log( action);

      eval(action)(apoc, keywordName, functionName, relName, () => {
        console.log('yay');
        callback();
      });
    });
}

const getAllVerbNodes = (callback) => {
  apoc.query('MATCH (n:Verb) return n').exec()
    .then(response => {
      let verbs = response[0].data.reduce((memo, verb) => {
        memo.push(verb.row[0].name);
        return memo;
      }, []);
      console.log(verbs);
      callback(verbs);
    })
}


const createAction = (req, res) => {
  console.log('creating action node');
  const verb = req.body.verb;
  const object = req.body['object'];
  const synonyms = req.body.synonyms;
  console.log('synonyms are:', synonyms);

  getAllVerbNodes((verbs) => {
    res.send(verbs);
  })

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

  //Context Creation Query
   // apoc.query('MATCH (n:Native {name: "Context Constructor"}) return n').exec()
   //  .then(response => {
   //    let action = response[0].data[0].row[0].code;
   //    console.log( action);

   //    eval(action)(apoc, "Test", () => {
   //      console.log('yay');
   //      res.send('woot');
   //    });
   //  })
   
   //Keyword Creation Query
   // apoc.query('MATCH (n:Native {name: "Keyword Constructor"}) return n').exec()
   //  .then(response => {
   //    let action = response[0].data[0].row[0].code;
   //    console.log( action);

   //    eval(action)(apoc, "Test", () => {
   //      console.log('yay');
   //      res.send('woot');
   //    });
   //  })

  // SYN Creation Query
  // apoc.query('MATCH (n:Native {name: "SYN Constructor"}) return n').exec()
  //   .then(response => {
  //     let action = response[0].data[0].row[0].code;
  //     console.log( action);

  //     eval(action)(apoc, "Test", "Test", "Action", () => {
  //       console.log('yay');
  //       res.send('woot');
  //     });
  //   })

  // ON Creation Query
  // apoc.query('MATCH (n:Native {name: "ON Constructor"}) return n').exec()
  //   .then(response => {
  //     let action = response[0].data[0].row[0].code;
  //     console.log( action);

  //     eval(action)(apoc, "Test", "Test", () => {
  //       console.log('yay');
  //       res.send('woot');
  //     });
  //   })

  // IDED Creation Query
  // apoc.query('MATCH (n:Native {name: "IDED Constructor"}) return n').exec()
  //   .then(response => {
  //     let action = response[0].data[0].row[0].code;
  //     console.log( action);

  //     eval(action)(apoc, "Test", "Test", () => {
  //       console.log('yay');
  //       res.send('woot');
  //     });
  //   })

  // OUTPUT Creation Query
  // apoc.query('MATCH (n:Native {name: "OUTPUT Constructor"}) return n').exec()
  //   .then(response => {
  //     let action = response[0].data[0].row[0].code;
  //     console.log( action);
  //     eval(action)(apoc, "Test", "Test", "TEST", () => {
  //       console.log('yay');
  //       res.send('woot');
  //     });
  //   })

}

export default { getFunction, createAction };
