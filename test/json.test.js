const preset = require('../src');
const babel = require('babel-core');

it('JSON.stringify', () => {
  const example = `
  JSON.stringify({});                  // '{}'
  JSON.stringify(true);                // 'true'
  JSON.stringify('foo');               // '"foo"'
  JSON.stringify([1, 'false', false]); // '[1,"false",false]'
  JSON.stringify({ x: 5 });            // '{"x":5}'
  
  JSON.stringify(new Date(2006, 0, 2, 15, 4, 5)) 
  // '"2006-01-02T15:04:05.000Z"'
  
  JSON.stringify({ x: 5, y: 6 });
  // '{"x":5,"y":6}'
  JSON.stringify([new Number(3), new String('false'), new Boolean(false)]);
  // '[3,"false",false]'
  
  JSON.stringify({ x: [10, undefined, function(){}, Symbol('')] }); 
  // '{"x":[10,null,null,null]}' 
   
  // Symbols:
  JSON.stringify({ x: undefined, y: Object, z: Symbol('') });
  // '{}'
  JSON.stringify({ [Symbol('foo')]: 'foo' });
  // '{}'
  JSON.stringify({ [Symbol.for('foo')]: 'foo' }, [Symbol.for('foo')]);
  // '{}'
  JSON.stringify({ [Symbol.for('foo')]: 'foo' }, function(k, v) {
    if (typeof k === 'symbol') {
      return 'a symbol';
    }
  });
  // '{}'
  
  // Non-enumerable properties:
  JSON.stringify( Object.create(null, { x: { value: 'x', enumerable: false }, y: { value: 'y', enumerable: true } }) );
  // '{"y":"y"}'
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});

it('JSON.parse', () => {
  const example = `
  JSON.parse('{}');              // {}
  JSON.parse('true');            // true
  JSON.parse('"foo"');           // "foo"
  JSON.parse('[1, 5, "false"]'); // [1, 5, "false"]
  JSON.parse('null');            // null
  `;

  const { code } = babel.transform(example, { presets: [preset] });
  expect(code).toMatchSnapshot();
});
