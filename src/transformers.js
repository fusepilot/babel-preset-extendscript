const template = require('babel-template');

const consoleTime = `
var NAME_TIME;
var NAME_TIME_END;

(function() {
  var timers = {};

  NAME_TIME = function(name) {
    if (name) timers[name] = Date.now();
  };

  NAME_TIME_END = function(name) {
    if (timers[name]) {
      console.log(name + ': ' + (Date.now() - timers[name]) + 'ms' );
      delete timers[name];
    }
  };
})()
`;

const setTimeout = `
function NAME() {
  if (!GLOBAL._timers) GLOBAL._timers = {}

  function guid() {
    var s4 = function() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); };
    return s4() + s4() + s4() + s4()  + s4()  + s4() + s4() + s4();
  }

  return function(func,millis) {
    var id = guid();
    GLOBAL._timers[id] = func;
    return app.scheduleTask('$._timers["' + id + '"]();',millis,false);
  };
}()
`;

const setInterval = `
function NAME() {
  if (!GLOBAL._intervals) GLOBAL._intervals = {}

  function guid() {
    var s4 = function() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); };
    return s4() + s4() + s4() + s4()  + s4()  + s4() + s4() + s4();
  }

  return function(func, millis) {
    var id = guid();
    GLOBAL._intervals[id] = func;
    GLOBAL.writeln(id)
    return app.scheduleTask('$._intervals["' + id + '"]();',millis,true);
  };
}()
`;

const clearTimeout = `
function(id) {
  app.cancelTask(id);
};
`;

const clearInterval = `
function(id) {
  app.cancelTask(id);
};
`;

const consoleLog = `
function() {
  for(var i = 0; i < arguments.length; ++i) {
    GLOBAL.write(arguments[i]);
    GLOBAL.write(' ');
  }
  GLOBAL.writeln();
};
`;

// http://es5.github.com/#x15.2.3.8
const objectSeal = `
function(object) {
  if (Object(object) !== object) {
    throw new TypeError('Object.seal can only be called on Objects.');
  }
  // this is misleading and breaks feature-detection, but
  // allows "securable" code to "gracefully" degrade to working
  // but insecure code.
  return object;
};
`;

// http://es5.github.com/#x15.2.3.9
const objectFreeze = `
function(object) {
  if (Object(object) !== object) {
    throw new TypeError('Object.freeze can only be called on Objects.');
  }
  // this is misleading and breaks feature-detection, but
  // allows "securable" code to "gracefully" degrade to working
  // but insecure code.
  return object;
};
`;

// http://es5.github.com/#x15.2.3.10
const objectPreventExtensions = `
function(object) {
  if (Object(object) !== object) {
    throw new TypeError('Object.preventExtensions can only be called on Objects.');
  }
  // this is misleading and breaks feature-detection, but
  // allows "securable" code to "gracefully" degrade to working
  // but insecure code.
  return object;
};
`;

// http://es5.github.com/#x15.2.3.11
const objectIsSealed = `
function(object) {
  if (Object(object) !== object) {
    throw new TypeError('Object.isSealed can only be called on Objects.');
  }
  return false;
};
`;

// http://es5.github.com/#x15.2.3.12
const objectIsFrozen = `
function(object) {
  if (Object(object) !== object) {
    throw new TypeError('Object.isFrozen can only be called on Objects.');
  }
  return false;
};
`;

// http://es5.github.com/#x15.2.3.13
const objectIsExtensible = `
function(object) {
  // 1. If Type(O) is not Object throw a TypeError exception.
  if (Object(object) !== object) {
    throw new TypeError('Object.isExtensible can only be called on Objects.');
  }
  // 2. Return the Boolean value of the [[Extensible]] internal property of O.
  var name = '';
  while (owns(object, name)) {
    name += '?';
  }
  object[name] = true;
  var returnValue = owns(object, name);
  delete object[name];
  return returnValue;
};
`;

// https://gist.github.com/jonfalcon/4715325
const objectKeys = `
function(obj) {
  var hasOwnProperty = Object.prototype.hasOwnProperty,
      hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
      dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ],
      dontEnumsLength = dontEnums.length;

  if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
    throw new TypeError('Object.keys called on non-object');
  }

  var result = [], prop, i;

  for (prop in obj) {
    if (hasOwnProperty.call(obj, prop)) {
      result.push(prop);
    }
  }

  if (hasDontEnumBug) {
    for (i = 0; i < dontEnumsLength; i++) {
      if (hasOwnProperty.call(obj, dontEnums[i])) {
        result.push(dontEnums[i]);
      }
    }
  }
  return result;
};
`;

const objectGetProtoOf = `
function(object) {
    /* eslint-disable no-proto */
    var proto = object.__proto__;
    /* eslint-enable no-proto */
    if (proto || proto === null) {
        return proto;
    } else if (toStr(object.constructor) === '[object Function]') {
        return object.constructor.prototype;
    } else if (object instanceof Object) {
        return prototypeOfObject;
    } else {
        // Correctly return null for Objects created with 'Object.create(null)'
        // (shammed or native) or '{ __proto__: null}'.  Also returns null for
        // cross-realm objects on browsers that lack '__proto__' support (like
        // IE <11), but that's the best we can do.
        return null;
    }
};
`;

const objectAssign = `
function(target, source) {
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
        target[key] = arguments[i][key];
      }
    }
  }
  return target;
}
`;

const objectGetOwnPropertyNames = `
function(object) {
  return Object.keys(object);
};
`;

const objectGetOwnPropertyDescriptor = `
function( object, key ) {
  return {
    configurable: false,
    writable: true,
    enumerable: false,
    value: object[ key ]
  }
}
`;

const objectCreate = `
(function() {
  var Temp = function() {};
  return function (prototype, propertiesObject) {
    if(prototype !== Object(prototype) && prototype !== null) {
      throw TypeError('Argument must be an object, or null');
    }
    Temp.prototype = prototype || {};
    if (propertiesObject !== undefined) {
      Object.defineProperties(Temp.prototype, propertiesObject);
    }
    var result = new Temp();
    Temp.prototype = null;
    // to imitate the case of Object.create(null)
    if(prototype === null) {
       result.__proto__ = null;
    }
    return result;
  };
})()
`;

const objectDefineProperty = `
function(object, property, descriptor) {
  if (descriptor) {
    delete descriptor.configurable;
    delete descriptor.enumerable;
    delete descriptor.writable;

    if (descriptor.value != undefined) {
      object[property] = descriptor.value;
    }
  }

  return object;
};
`;

const objectDefineProperties = `
function(object, descriptors) {
  var property;
  for (property in descriptors) {
    Object.defineProperty(object, property, descriptors[property]);
  }
  return object;
};
`;
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
const arrayIsArray = `
function(arg) {
  return Object.prototype.toString.call(arg) === '[object Array]';
};
`;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite
const numberIsFinite = `
function(arg) {
  return typeof arg === "number" && isFinite(arg);
};
`;

function createTransformPlugin(name, replace, code) {
  return function({ types: t }) {
    const defineName = name;
    return {
      visitor: {
        CallExpression(path, state) {
          if (
            path.get('callee').matchesPattern(replace) ||
            path.node.callee.name == replace
          ) {
            state[name].matches += 1;
            path.replaceWith(
              template(`${state[name].name}(ARGS)`)({
                GLOBAL: t.identifier('$'),
                ARGS: path.node.arguments,
              })
            );
          }
        },
        MemberExpression: {
          enter(path, state) {
            const memberName = `${path.node.object.name}.${
              path.node.property.name
            }`;

            if (memberName == replace) {
              state[name].matches += 1;
              path.replaceWith(t.identifier(state[name].name));
            }
          },
        },
        Program: {
          enter(path, state) {
            state[name] = {
              name: path.scope.generateUidIdentifier(name).name,
              matches: 0,
            };
          },
          exit(path, state) {
            if (state[name].matches == 0) return;

            const topNodes = [];
            topNodes.push(
              template(`var ${state[name].name} = ${code}`)({
                GLOBAL: t.identifier('$'),
                NAME: t.identifier(state[name].name),
              })
            );
            path.unshiftContainer('body', topNodes);
          },
        },
      },
    };
  };
}

function createTransformPluginMultiple(name, replacers, code) {
  return function({ types: t }) {
    return {
      visitor: {
        CallExpression: function(path, state) {
          Object.keys(replacers).map(key => {
            const replace = key;
            const token = replacers[key];

            if (
              path.get('callee').matchesPattern(replace) ||
              path.node.callee.name == replace
            ) {
              state[name].matches = state[name].matches + 1;
              path.replaceWith(
                template(`${state[name].tokens[token]}(ARGS)`)({
                  GLOBAL: t.identifier('$'),
                  ARGS: path.node.arguments,
                })
              );
            }
          });
        },
        Program: {
          enter(path, state) {
            state[name] = {
              matches: 0,
              tokens: {},
            };
            Object.keys(replacers).map(key => {
              const replace = key;
              const token = replacers[key];
              state[name].tokens[token] = path.scope.generateUidIdentifier(
                replace
              ).name;
            });
          },
          exit(path, state) {
            if (!code || !state[name] || state[name].matches == 0) return;

            const topNodes = [];
            const tokens = {};
            Object.keys(state[name].tokens).forEach(token => {
              tokens[token] = t.identifier(state[name].tokens[token]);
            });

            topNodes.push(
              template(`${code}`)(
                Object.assign({}, { GLOBAL: t.identifier('$') }, tokens)
              )
            );
            path.unshiftContainer('body', topNodes[0]);
          },
        },
      },
    };
  };
}

function createTransformPluginNoWrap(replace, code) {
  return function({ types: t }) {
    return {
      visitor: {
        CallExpression: function(path, file) {
          if (
            path.get('callee').matchesPattern(replace) ||
            path.node.callee.name == replace
          ) {
            path.replaceWith(
              template(code)({
                GLOBAL: t.identifier('$'),
                ARGS: path.node.arguments,
              })
            );
          }
        },
        MemberExpression: {
          exit(path, state) {
            const memberName = `${path.node.object.name}.${
              path.node.property.name
            }`;

            if (memberName == replace) {
              path.replaceWith(t.identifier('$.writeln'));
            }
          },
        },
      },
    };
  };
}

function wrapNestedConditionalExpressions({ types: t }) {
  return {
    visitor: {
      ConditionalExpression: {
        exit(path) {
          const { node } = path;
          if (path.parent.type == 'ConditionalExpression') {
            path.replaceWith(t.parenthesizedExpression(t.toExpression(node)));
          }
        },
      },
    },
  };
}

const codeArrayFilter = `
function(array, callback) {
  var newArray = []
  for (var i = 0; i < array.length; i++) {
    if (callback(array[i], i, array)) newArray.push(array[i]);
  }
  return newArray;
};
`;

const codeArrayMap = `
function(array, callback) {
  var newArray = []
  for (var i = 0; i < array.length; i++) {
    newArray.push(callback(array[i], i, array));
  }
  return newArray;
};
`;

const codeArrayReduce = `
function(array, callback) {
  if (array == null) {
    throw new TypeError('Array.prototype.reduce called on null or undefined');
  }
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }
  var t = Object(array), len = t.length >>> 0, k = 0, value;
  if (arguments.length >= 3) {
    value = arguments[2];
  } else {
    while (k < len && !(k in t)) {
      k++;
    }
    if (k >= len) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    value = t[k++];
  }
  for (; k < len; k++) {
    if (k in t) {
      value = callback(value, t[k], k, t);
    }
  }
  return value;
};
`;

const codeArrayForEach = `
function(array, callback) {
  for (var i = 0; i < array.length; i++) {
    callback(array[i], i, array);
  }
};
`;

const codeArrayFind = `
function(array, callback) {
  for (var i = 0; i < array.length; i++) {
    var item = array[i];
    if (callback(item, i, array)) return item;
  }
};
`;

function createMemberExpressionPolyfill(name, replace, code) {
  const replaceWith = `_${replace}`;
  return function({ types: t }) {
    return {
      visitor: {
        Program: {
          enter(path, state) {
            state[name] = {};
            state[name].name = path.scope.generateUidIdentifier(
              replaceWith
            ).name;
            state[name].matches = 0;
          },
          exit(path, state) {
            if (!state[name].matches > 0) return;

            const topNodes = [];
            topNodes.push(
              template(`var ${state[name].name} = ${code}`)({
                GLOBAL: t.identifier('$'),
                NAME: t.identifier(state[name].name),
              })
            );
            path.unshiftContainer('body', topNodes);
          },
        },
        CallExpression(path, state) {
          const callee = path.node.callee;
          const node = path.node;

          if (t.isIdentifier(callee.property, { name: replace })) {
            state[name].matches = state[name].matches + 1;

            let arrayName;
            const callback = node.arguments[0];

            let array;

            if (!t.isIdentifier(callee.object)) {
              // e.g, getItems().forEach
              array = callee.object;
            } else {
              // myArray.forEach
              array = t.identifier(callee.object.name);
            }
            let extraVarsCode = '';
            let extraVarsReplace = {};
            if(node.arguments.length > 1) {
              for(let i = 1; i < node.arguments.length; i++) {
                const argName = `ARG${i}`;
                extraVarsCode = `, ${argName}`
                extraVarsReplace = {[argName]: node.arguments[i], ...extraVarsReplace}
              }
            }
            path.replaceWith(
              template(`GENERATED_FUNCTION_NAME(ARRAY, UPDATE_FUNCTION ${extraVarsCode})`)({
                ARRAY: array,
                UPDATE_FUNCTION: callback,
                ...extraVarsReplace,
                GENERATED_FUNCTION_NAME: t.identifier(state[name].name),
              })
            );
          }
        },
      },
    };
  };
}

module.exports = [
  // convenience
  createTransformPlugin('_consoleLog', 'console.log', consoleLog),
  createTransformPlugin('_setTimeout', 'setTimeout', setTimeout),
  createTransformPlugin('_setInterval', 'setInterval', setInterval),
  createTransformPlugin('_clearTimeout', 'clearTimeout', clearTimeout),
  createTransformPlugin('_clearInterval', 'clearInterval', clearInterval),

  // shams
  createTransformPlugin(
    '_objectGetProtoOf',
    'Object.getPrototypeOf',
    objectGetProtoOf
  ),
  createTransformPlugin(
    '_objectDefineProperty',
    'Object.defineProperty',
    objectDefineProperty
  ),
  createTransformPlugin(
    '_objectDefineProperties',
    'Object.defineProperties',
    objectDefineProperties
  ),
  createTransformPlugin(
    '_objectGetOwnPropertyNames',
    'Object.getOwnPropertyNames',
    objectGetOwnPropertyNames
  ),
  createTransformPlugin(
    '_objectGetOwnPropertyDescriptor',
    'Object.getOwnPropertyDescriptor',
    objectGetOwnPropertyDescriptor
  ),
  createTransformPlugin('_objectSeal', 'Object.seal', objectSeal),
  createTransformPlugin('_objectFreeze', 'Object.freeze', objectFreeze),
  createTransformPlugin('_objectIsSealed', 'Object.isSealed', objectIsSealed),
  createTransformPlugin('_objectIsFrozen', 'Object.isFrozen', objectIsFrozen),
  createTransformPlugin(
    '_objectIsExtensible',
    'Object.isExtensible',
    objectIsExtensible
  ),

  // shims
  createTransformPlugin('_objectKeys', 'Object.keys', objectKeys),
  // createTransformPlugin('_objectValues', 'Object.values', objectValues),
  createTransformPlugin('_objectAssign', 'Object.assign', objectAssign),
  createTransformPlugin(
    '_objectPreventExtensions',
    'Object.preventExtensions',
    objectPreventExtensions
  ),
  createTransformPlugin('_objectCreate', 'Object.create', objectCreate),
  createTransformPlugin('_arrayIsArray', 'Array.isArray', arrayIsArray),
  createTransformPlugin('_numberIsFinite', 'Number.isFinite', numberIsFinite),
  createTransformPluginMultiple(
    'console.time',
    {
      'console.time': 'NAME_TIME',
      'console.timeEnd': 'NAME_TIME_END',
    },
    consoleTime
  ),
  createMemberExpressionPolyfill('Array.forEach', 'forEach', codeArrayForEach),
  createMemberExpressionPolyfill('Array.find', 'find', codeArrayFind),
  createMemberExpressionPolyfill('Array.filter', 'filter', codeArrayFilter),
  createMemberExpressionPolyfill('Array.map', 'map', codeArrayMap),
  createMemberExpressionPolyfill('Array.reduce', 'reduce', codeArrayReduce),

  // fixes
  wrapNestedConditionalExpressions,
];
