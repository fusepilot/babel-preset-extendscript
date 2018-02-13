const preset = require('../src');
const babel = require('babel-core');

it('console.log', () => {
  const example = `
  console.log('hello world')
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('setTimeout', () => {
  const example = `
  setTimeout(() => {
    $.writeln('yo')
  }, 1000)
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('clearTimeout', () => {
  const example = `
  const timeout = setTimeout(() => {
    $.writeln('yo')
  }, 1000)

  clearTimeout(timeout)
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('setInterval', () => {
  const example = `
  setInterval(() => {
    $.writeln('yo')
  }, 1000)
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('clearInterval', () => {
  const example = `
  const interval = setInterval(() => {
    $.writeln('yo')
  }, 1000)

  clearInterval(interval)
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('console.time', () => {
  const example = `
  console.time(label);
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});
