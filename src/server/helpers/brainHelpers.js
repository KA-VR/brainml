/* eslint-disable no-console, no-eval */
import apoc from 'apoc';

const getExactNode = (nodeName, nodeType, callback) => {
  apoc.query('MATCH (n:%nodeType% {name: "%nodeName%"}) return n', { nodeName, nodeType }).exec()
    .then(response => {
      console.log(response);
      if (response[0].data.length === 0) {
        console.log('node is not here.....');
        callback('node is not here');
      } else {
        callback(response[0].data[0].row[0]);
      }
    });
};

const createFunctionNode = (functionName, callback) => {
  apoc.query('MATCH (n:Native {name: "Function Constructor"}) return n').exec()
    .then(response => {
      const action = response[0].data[0].row[0].code;
      console.log(action);

      eval(action)(apoc, functionName, () => {
        console.log('yay');
        callback();
      });
    });
};

const createActionNode = (actionName, callback) => {
  apoc.query('MATCH (n:Native {name: "Action Constructor"}) return n').exec()
    .then(response => {
      const action = response[0].data[0].row[0].code;
      console.log(action);

      eval(action)(apoc, actionName, () => {
        console.log('yay');
        callback();
      });
    });
};

const createVerbNode = (verbName, callback) => {
  apoc.query('MATCH (n:Native {name: "Verb Constructor"}) return n').exec()
    .then(response => {
      const action = response[0].data[0].row[0].code;
      console.log(action);

      eval(action)(apoc, verbName, () => {
        console.log('yay');
        callback();
      });
    });
};

const createContextNode = (contextName, callback) => {
  apoc.query('MATCH (n:Native {name: "Context Constructor"}) return n').exec()
  .then(response => {
    const action = response[0].data[0].row[0].code;
    console.log(action);

    eval(action)(apoc, contextName, () => {
      console.log('yay');
      callback();
    });
  });
};

const createKeywordNode = (keywordName, callback) => {
  apoc.query('MATCH (n:Native {name: "Keyword Constructor"}) return n').exec()
   .then(response => {
     const action = response[0].data[0].row[0].code;
     console.log(action);

     eval(action)(apoc, 'Test', () => {
       console.log('yay');
       callback();
     });
   });
};

const createSYNRel = (verbName, nodeName, nodeType, callback) => {
  apoc.query('MATCH (n:Native {name: "SYN Constructor"}) return n').exec()
    .then(response => {
      const action = response[0].data[0].row[0].code;
      console.log(action);

      eval(action)(apoc, verbName, nodeName, nodeType, () => {
        console.log('yay');
        callback();
      });
    });
};

const createONRel = (actionName, contextName, callback) => {
  apoc.query('MATCH (n:Native {name: "ON Constructor"}) return n').exec()
    .then(response => {
      const action = response[0].data[0].row[0].code;
      console.log(action);

      eval(action)(apoc, actionName, contextName, () => {
        console.log('yay');
        callback();
      });
    });
};

const createIDEDRel = (contextName, keywordName, callback) => {
  apoc.query('MATCH (n:Native {name: "IDED Constructor"}) return n').exec()
    .then(response => {
      const action = response[0].data[0].row[0].code;
      console.log(action);

      eval(action)(apoc, contextName, keywordName, () => {
        console.log('yay');
        callback();
      });
    });
};

const createOUTPUTRel = (keywordName, functionName, actionName, callback) => {
  const relName = actionName.toUpperCase();
  apoc.query('MATCH (n:Native {name: "OUTPUT Constructor"}) return n').exec()
    .then(response => {
      const action = response[0].data[0].row[0].code;
      console.log(action);

      eval(action)(apoc, keywordName, functionName, relName, () => {
        console.log('yay');
        callback();
      });
    });
};

const createWITHRel = (context1, context2, callback) => {
  apoc.query('MATCH (n:Native {name: "WITH Constructor"}) return n').exec()
    .then(response => {
      const action = response[0].data[0].row[0].code;
      console.log(action);

      eval(action)(apoc, context1, context2, () => {
        console.log('yay');
        callback();
      });
    });
};

const getAllNodesByType = (type, callback) => {
  apoc.query('MATCH (n:%type%) return n', { type }).exec()
    .then(response => {
      const nodes = response[0].data.reduce((memo, node) => {
        memo.push(node.row[0].name);
        return memo;
      }, []);
      console.log(nodes);
      callback(nodes);
    });
};

export default { getExactNode,
	createFunctionNode,
	createActionNode,
  createVerbNode,
  createContextNode,
  createKeywordNode,
  createSYNRel,
  createONRel,
  createIDEDRel,
  createOUTPUTRel,
  createWITHRel,
  getAllNodesByType,
};
