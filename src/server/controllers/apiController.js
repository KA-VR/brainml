/* eslint-disable no-console */
import apoc from 'apoc';
import async from 'async';
import brainHelpers from '../helpers/brainHelpers';

// TODO: Handle context when array
const determineContext = (action, context, callback) => {
  const arr = typeof context === 'string' ? [context] : context;
  console.log('arr is:', arr);
  const results = [];
  let last;
  async.eachSeries(arr, (obj, cb) => {
    console.log('current obj is: ', obj);
    apoc.query('MATCH (m:Context {name: "%obj%"}) return m',
      { action, obj }).exec().then(response => {
        console.log(response);
        if (response[0].data.length === 0) {
          console.log('nothing is here!');
          brainHelpers.createContextNode(obj, () => {
            results.push(obj);
            cb();
          });
        } else {
          results.push(response[0].data[0].row[0].name);
          cb();
        }
      })
      .catch(err => {
        console.log('Error retrieving context: ', err);
      });
  }, (err) => {
    if (err) {
      console.log('Error determining context: ', err);
    }
    console.log('Finished checking context for each context: ', results);
    async.forEachOfSeries(results, (res, i, cb) => {
      console.log(i);
      apoc.query('MATCH (n)-[r]->(m {name:"%res%"}) return m', { res }).exec()
        .then(response2 => {
          console.log('checking of relationship exists result:', response2);
          if (i === results.length - 1) {
            last = res;
          }
          if (response2[0].data.length === 0) {
            if (i === 0) {
              brainHelpers.createONRel(action, res, () => {
                cb();
              });
            } else {
              console.log('creating REL');
              brainHelpers.createWITHRel(results[i - 1], res, () => {
                cb();
              });
            }
          } else {
            console.log('relationship already exists');
            if (i !== 0) {
              const beforeLast = results[i - 1];
              console.log('one before this was:', beforeLast);
              console.log('curr one was:', res);
              apoc.query('MATCH (n {name:"%beforeLast%"})-[r]->(m {name:"%res%"}) return r',
                { beforeLast, res }).exec().then(response4 => {
                  console.log('checking of relationship exists result:', response4);
                  if (response4[0].data.length === 0) {
                    brainHelpers.createWITHRel(beforeLast, res, () => {
                      cb();
                    });
                  } else {
                    cb();
                  }
                });
            } else {
              cb();
            }
          }
        });
    }, (err2) => {
      if (err2) {
        console.log('Error connecting relationships: ', err);
      }
      console.log('last is still: ', last);
      const contextObj = {
        name: last,
      };
      apoc.query('MATCH (n:Context {name:"%last%"})-[r]->(m:Keyword {name:"default"}) return r',
        { last }).exec().then(response3 => {
          if (response3[0].data.length === 0) {
            brainHelpers.createIDEDRel(last, 'default', () => {
              callback(contextObj);
            });
          } else {
            callback(contextObj);
          }
        });
    });
  });
};

// Gets the keyword of the statement
const determineKeyword = (context, keywords, callback) => {
  console.log('Keywords are:');
  apoc.query('MATCH (n:Context {name: "%context"})-[r:IDED]->(m:Keyword) return m',
    { context }).exec().then(response => {
      console.log(response);
      let keyword = { name: 'default' };
      if (response[0].data.length === 0) {
        console.log('not sure what to do bro....');
        // TODO: need to decide what do about this
      } else {
        keyword = response[0].data[0].row[0].name;
      }
      callback(keyword);
    })
    .catch(err => {
      console.log('Error retrieving keyword: ', err);
    });
};

const determineFunction = (action, keyword, callback) => {
  const act = action.toUpperCase();
  console.log(act);
  console.log(keyword);
  apoc.query('MATCH (n:Keyword {name: "%keyword%"})-[r:%act%]-> (m:Function) return m',
    { keyword, act }).exec().then(response => {
      console.log(response);
      const fn = response[0].data[0].row[0];
      callback(fn);
    });
};

// from verb determine action:
const determineAction = (verb, synonyms, callback) => {
  console.log('the synonyms are: ', synonyms);
  apoc.query('MATCH (n:Verb {name:"%verb%"})-[:SYN*]->(m:Action) return m', { verb }).exec()
    .then(response => {
      console.log(response);
      let action = 'nothing';
      if (response[0].data.length === 0) {
        console.log('nothing is here.....');
        // Gets all existing verb nodes
        brainHelpers.getAllNodesByType('Verb', (verbs) => {
          // iterate over all existing verb nodes
          console.log('the verbs are:', verbs);
          for (let i = 0; i < verbs.length; i++) {
            console.log('count is:', i);
            console.log('current verb is:', verbs[i]);
            // if synonyms of unknown verb matches an existing verb
            if (synonyms.indexOf(verbs[i]) > -1) {
              const syn = verbs[i];
              console.log('found a match!');
              // create a verb node with the unknown verb
              // eslint-disable-next-line no-loop-func
              brainHelpers.createVerbNode(verb, () => {
                console.log('created new verb node!');
                // create a new syn relationship between that new verb node
                // and the existing synonym verb node
                brainHelpers.createSYNRel(verb, syn, 'Verb', () => {
                  console.log('created SYN relationship!');
                  apoc.query(`MATCH (n:Verb {name:"%verb%"})-[:SYN*]->(m:Verb {name:"%syn%"})
                    return m`, { verb, syn }).exec().then(response2 => {
                      action = response2[0].data[0].row[0];
                      console.log('Action is:', action);
                      callback(action);
                    });
                });
              });
            } else {
              action = {
                name: 'unknown',
              };
              console.log('didnt match!');
              callback(action);
            }
          }
          // if synonym not found get all actions as ask user what they mean
        });
      } else {
        action = response[0].data[0].row[0];
        console.log('Action is:', action);
        callback(action);
      }
    })
    .catch(err => {
      console.log('error here', err);
    });
};

const getFunction = (req, res) => {
  console.log('In get Function', req.body);
  const verb = req.body.verb;
  const object = req.body['object[]'];
  const synonyms = req.body['synonyms[]'];
  const keywords = req.body.keywords;
  console.log('Object is:', object);
  console.log('synonyms are:', synonyms);
  let responseObject;
  determineAction(verb, synonyms, (action) => {
    // checks for if context connected to action exists
    console.log('Action is:', action);
    if (action.name === 'unknown') {
      brainHelpers.getAllNodesByType('Action', (actions) => {
        console.log('All actions are: ', actions);
        responseObject = {
          actions,
          found: false,
        };
        res.send(responseObject);
      });
    } else {
      determineContext(action.name, object, (context) => {
        // checks if keyword connecting to context exists
        console.log('Context is:', context);
        determineKeyword(context.name, keywords, (keyword) => {
          // retrieves function
          console.log('Keyword is:', keyword);
          const certain = keyword.name !== 'default';
          determineFunction(action.name, keyword.name, (fn) => {
            console.log('Function is:', fn);
            responseObject = {
              funct: fn,
              context: context.name,
              found: true,
              certain,
            };
            res.send(responseObject);
          });
        });
      });
    }
  });
};

const createAction = (req, res) => {
  // console.log('creating action node');
  // const verb = req.body.verb;
  // const object = req.body.object;

  // res.send('hi', verb, object);
  // const synonyms = req.body.synonyms;
  // console.log('synonyms are:', synonyms);
  brainHelpers.getAllNodesByType('Function', (nodes) => {
    res.send(nodes);
  });

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

  // Context Creation Query
   // apoc.query('MATCH (n:Native {name: "Context Constructor"}) return n').exec()
   //  .then(response => {
   //    let action = response[0].data[0].row[0].code;
   //    console.log( action);

   //    eval(action)(apoc, "Test1", () => {
   //      console.log('yay');
   //      res.send('woot');
   //    });
   //  })

   // Keyword Creation Query
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

  // WITH Creation Query
  // apoc.query('MATCH (n:Native {name: "WITH Constructor"}) return n').exec()
  //   .then(response => {
  //     let action = response[0].data[0].row[0].code;
  //     console.log( action);

  //     eval(action)(apoc, "Test", "Test1", () => {
  //       console.log('yay');
  //       res.send('woot');
  //     });
  //   });
};

export default { getFunction, createAction };
