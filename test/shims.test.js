const preset = require('../src');
const babel = require('babel-core');

it('Object.keys', () => {
  const example = `
  var obj = { 0: 'a', 1: 'b', 2: 'c' }
  $.writeln(Object.keys(obj)); // console: ['0', '1', '2']
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('Object.create', () => {
  const example = `
  var o = Object.create({}, { p: { value: 42 } });
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('Object.assign', () => {
  const example = `
  var obj = { a: 1 };
  var copy = Object.assign({}, obj);
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('Array.isArray', () => {
  const example = `
  Array.isArray([]);
  Array.isArray([1]);
  Array.isArray(new Array());
  // Little known fact: Array.prototype itself is an array:
  Array.isArray(Array.prototype); 
  
  // all following calls return false
  Array.isArray();
  Array.isArray({});
  Array.isArray(null);
  Array.isArray(undefined);
  Array.isArray(17);
  Array.isArray('Array');
  Array.isArray(true);
  Array.isArray(false);
  Array.isArray({ __proto__: Array.prototype });
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('Number.isFinite', () => {
  const example = `
  Number.isFinite(Infinity);  // false
  Number.isFinite(NaN);       // false
  Number.isFinite(-Infinity); // false
  
  Number.isFinite(0);         // true
  Number.isFinite(2e64);      // true
  
  Number.isFinite('0');       // false, would've been true with
                              // global isFinite('0')
  Number.isFinite(null);      // false, would've been true with
                              // global isFinite(null)
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('Array.prototype.forEach()', () => {
  const example = `
  const items = ['item1', 'item2', 'item3'];
  const copy = [];
  
  items.forEach(function(item){
    copy.push(item)
  });
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('Array.prototype.find()', () => {
  const example = `
  var inventory = [
    {name: 'apples', quantity: 2},
    {name: 'bananas', quantity: 0},
    {name: 'cherries', quantity: 5}
  ];

  function findCherries(fruit) { 
    return fruit.name === 'cherries';
  }

  $.writeln(inventory.find(findCherries));
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('Array.prototype.filter()', () => {
  const example = `
  function isBigEnough(value) {
    return value >= 10;
  }
  
  var filtered = [12, 5, 8, 130, 44].filter(isBigEnough);
  // filtered is [12, 130, 44]
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('Array.prototype.map()', () => {
  const example = `
  var numbers = [1, 4, 9];
  var roots = numbers.map(Math.sqrt);
  // roots is now [1, 2, 3]
  // numbers is still [1, 4, 9]
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('Array.prototype.reduce()', () => {
  const example = `
  // create an array
  var numbers = [0, 1, 2, 3];
  
  /* call reduce() on the array, passing a callback
  that adds all the values together */
  var result = numbers.reduce(function(accumulator, currentValue) {
      return accumulator + currentValue;
  });
  
  // log the result
  $.writeln(result);
  // expected output: 6
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});
