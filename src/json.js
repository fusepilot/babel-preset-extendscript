const template = require('babel-template')
const fs = require('fs')


const jsonStringify = fs.readFileSync('/Users/michael/Workspace/ae-dev/babel-preset-extendscript/src/jsonify/stringify.js').toString()
const jsonParse = fs.readFileSync('/Users/michael/Workspace/ae-dev/babel-preset-extendscript/src/jsonify/parse.js').toString()

function createTransformPlugin(name, replace, code) {
  return function transformObjectGetProtoOf({types: t}) {
    const defineName = name;
    return {
      visitor: {
        CallExpression: function (path, state) {
          if (path.get("callee").matchesPattern(replace)) {
            state[name] = true

            path.replaceWith(template(`${defineName}($0)`)(path.node.arguments));
          }
        },
        Program: {
          enter(path, state) {
            state[name] = false
          },
          exit(path, state) {
            if (!state[name]) return
            const topNodes = [];
            topNodes.push(template(`var ${defineName} = ${code}`)());
            path.unshiftContainer('body', topNodes);
          },
        },
      }
    }
  }
}

module.exports = [
  createTransformPlugin('_jsonStringify', 'JSON.stringify', jsonStringify),
  createTransformPlugin('_jsonParse', 'JSON.parse', jsonParse),
]
