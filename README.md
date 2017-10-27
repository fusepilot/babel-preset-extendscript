# babel-preset-extendscript

> Babel preset for all extendscript plugins.

## Why
Because Adobe ( to their shame ) probably wont update the Javascript version (es3) that powers ExtendScript in the near future. Until they do, ExtendScript is stuck in 1999.

## Install

```sh
$ npm install --save-dev babel-preset-extendscript
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
