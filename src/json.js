const template = require('@babel/template');
const fs = require('fs');
const path = require('path');

const jsonStringify = fs
  .readFileSync(path.join(__dirname, 'jsonify', 'stringify.js'))
  .toString();
const jsonParse = fs
  .readFileSync(path.join(__dirname, 'jsonify', 'parse.js'))
  .toString();

function createTransformPlugin(name, replace, code) {
  return function transformObjectGetProtoOf({ types: t }) {
    const defineName = name;
    return {
      visitor: {
        CallExpression: function(path, state) {
          if (path.get('callee').matchesPattern(replace)) {
            state[name] = true;
            path.replaceWith(
              template.default(`${defineName}($0)`)(path.node.arguments)
            );
          }
        },
        Program: {
          enter(path, state) {
            state[name] = false;
          },
          exit(path, state) {
            if (!state[name]) return;
            const topNodes = [];
            topNodes.push(template.default(`var ${defineName} = ${code}`, { placeholderPattern: false })());
            path.unshiftContainer('body', topNodes);
          },
        },
      },
    };
  };
}

module.exports = [
  createTransformPlugin('_jsonStringify', 'JSON.stringify', jsonStringify),
  createTransformPlugin('_jsonParse', 'JSON.parse', jsonParse),
];
