# babel-preset-extendscript

## What
Babel preset for transpiling ES2015 and modern JS conventions to ES3. Mainly intended for use with Extendscript. 😱

## Why
Because modern Javascript has improved since the 90's. Thanks Adobe.

## Install

With NPM:
```sh
$ npm install --save-dev babel-preset-extendscript
```

With Yarn:

```sh
$ yarn add --dev babel-preset-extendscript
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "presets": ["extendscript"]
}
```

### Via CLI

```sh
$ babel script.js --presets extendscript
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  presets: ["extendscript"]
});
```

## Options

* `loose` - Enable "loose" transformations for any plugins in this preset that allow them (Disabled by default).
* `modules` - Enable transformation of ES6 module syntax to another module type (Enabled by default to "commonjs").
  * Can be `false` to not transform modules, or one of `["amd", "umd", "systemjs", "commonjs"]`

```
{
  presets: [
    ["extendscript", {"loose": true, "modules": "amd"}]
  ]
}
{
  presets: [
    ["extendscript", {"loose": true, "modules": false}]
  ]
}
```

## Features

### ES2015
* babel-plugin-transform-es2015

### Convenience
* console.log
* JSON.stringify
* JSON.parse
* setTimeout
* setInterval
* clearTimeout
* clearInterval

### Shims
* Object.keys
* Object.assign
* Object.create
* Array.isArray
* Number.isFinite
* Array.prototype.forEach
* Array.prototype.find
* Array.prototype.filter
* Array.prototype.map
* Array.prototype.reduce

### Shams
* Object.getPrototypeOf
* Object.defineProperty
* Object.defineProperties
* Object.getOwnPropertyNames
* Object.getOwnPropertyDescriptor
* Object.seal
* Object.freeze
* Object.isSealed
* Object.isFrozen
* Object.isExtensible

### Fixes
* Wraps all conditional expressions in parentheses to prevent `Expected: :` error.

## Known Issues
• CallExpression's that uses other transforms from this preset only insert them 1 level deep due to path.unshiftContainer adding a new CallExpression in Program:exit(). Need to figure out a way to do another Program:exit() after the first if new CallExpressions have been added so state[name].matches can be += 1'd.
