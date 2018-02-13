const preset = require('../src');
const babel = require('babel-core');

it('wrap conditionals in parentheses', () => {
  const example = `
  function toInteger(value) {
    var result = parseFloat(value), remainder = result % 1;
    return result === result ? remainder ? result - remainder : result : 0;
  }

  toInteger(2.1);
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});
