/**
 * This file is a bit of a mess. If you're looking at it as a reference for how to write a preset,
 * I'd recommend looking only at `function preset(){}` and ignoring the rest, unless your new preset
 * really needs to work on babel-core < 6.13.x, which is unlikely.
 */

/**
 * This preset was originally an object, before function-based configurable presets were introduced.
 * For backward-compatibility with anything that may have been loading this preset and expecting
 * it to be a simple Babel config object, we maintain the old config here.
 */
module.exports = preset({});

// For backward compatibility with babel-core < v6.13.x, we use the 'buildPreset' property
// of the preset object for the preset creation function.
Object.defineProperty(module.exports, 'buildPreset', {
  configurable: true,
  writable: true,
  // We make this non-enumerable so old versions of babel-core won't see it as an unknown property,
  // while allowing new versions to see it as a preset builder function.
  enumerable: false,
  value: preset,
});

function preset(context, opts) {
  const moduleTypes = ['commonjs', 'amd', 'umd', 'systemjs'];
  let loose = false;
  let modules = 'commonjs';
  let root;

  if (opts !== undefined) {
    if (opts.loose !== undefined) loose = opts.loose;
    if (opts.modules !== undefined) modules = opts.modules;
    if (opts.root !== undefined) root = opts.root;
  }

  if (typeof loose !== 'boolean')
    throw new Error("Preset es2015 'loose' option must be a boolean.");
  if (modules !== false && moduleTypes.indexOf(modules) === -1) {
    throw new Error(
      "Preset es2015 'modules' option must be 'false' to indicate no modules\n" +
        "or a module type which be be one of: 'commonjs' (default), 'amd', 'umd', 'systemjs'"
    );
  }

  return () => ({
    plugins: [
      [require('@babel/plugin-transform-template-literals').default, { loose }],
      require('@babel/plugin-transform-literals').default,
      require('@babel/plugin-transform-function-name').default,
      [require('@babel/plugin-transform-arrow-functions').default],
      require('@babel/plugin-transform-block-scoped-functions').default,
      [require('@babel/plugin-transform-classes').default, { loose }],
      require('@babel/plugin-transform-object-super').default,
      require('@babel/plugin-transform-shorthand-properties').default,
      require('@babel/plugin-transform-duplicate-keys').default,
      [
        require('@babel/plugin-transform-computed-properties').default,
        { loose },
      ],
      [require('@babel/plugin-transform-for-of').default, { loose }],
      require('@babel/plugin-transform-sticky-regex').default,
      require('@babel/plugin-transform-unicode-regex').default,
      require('@babel/plugin-check-constants').default,
      [require('@babel/plugin-transform-spread').default, { loose }],
      require('@babel/plugin-transform-parameters').default,
      [require('@babel/plugin-transform-destructuring').default, { loose }],
      require('@babel/plugin-transform-block-scoping').default,
      require('@babel/plugin-transform-property-literals').default,
      [
        require('@babel/plugin-proposal-object-rest-spread').default,
        { useBuiltIns: true },
      ],
      ...require('./transformers'),
      ...require('./json'),
    ].filter(Boolean),
  });
}
