const preset = require('../src');
const babel = require('babel-core');

it('Object.getPrototypeOf', () => {
  const example = `
  var proto = {};
  var obj = Object.create(proto);
  Object.getPrototypeOf(obj) === proto;
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('Object.defineProperty', () => {
  const example = `
  var o = {};
  
  Object.defineProperty(o, 'a', {
    value: 37,
    writable: true,
    enumerable: true,
    configurable: true
  });
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('Object.defineProperties', () => {
  const example = `
  var obj = {};
  Object.defineProperties(obj, {
    'property1': {
      value: true,
      writable: true
    },
    'property2': {
      value: 'Hello',
      writable: false
    }
    // etc. etc.
  });
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('Object.getOwnPropertyNames', () => {
  const example = `
  var obj = { 0: 'a', 1: 'b', 2: 'c' };
  
  // Logging property names and values using Array.forEach
  Object.getOwnPropertyNames(obj).forEach(
    function (val, idx, array) {
      $.writeln(val + ' -> ' + obj[val]);
    }
  );
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('Object.getOwnPropertyDescriptor', () => {
  const example = `
  var o = { get foo() { return 17; } };
  var d = Object.getOwnPropertyDescriptor(o, 'foo');
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('Object.seal', () => {
  const example = `
  var o = Object.seal(obj);
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('Object.freeze', () => {
  const example = `
  var o = Object.freeze(obj);
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('Object.isSealed', () => {
  const example = `
  var empty = {};
  Object.isSealed(empty);
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('Object.isFrozen', () => {
  const example = `
  Object.isFrozen({});
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('Object.isExtensible', () => {
  const example = `
  var empty = {};
  Object.isExtensible(empty);
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('Object.preventExtensions', () => {
  const example = `
  var empty = {};
  Object.preventExtensions(empty);
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});
