var test = require('test-kit').tape()

var uint = require('.')

test('uint: throws', function (t) {
  var buf = new Uint8Array(5)
  t.tableAssert(
    [
      [ 'fn',      'input',                'exp' ],
      [ 'size',    [Math.pow(2, 53)],      /greater than max safe integer/ ],
      [ 'size',    [1 / 0],                /greater than max safe integer/ ],
      [ 'size',    [-1],                   /cannot be negative/ ],
      [ 'size',    [-1 / 0],               /cannot be negative/ ],
      [ 'size',    [],                     /cannot convert/ ],
      [ 'write',   [0x7FFFFFFF + 1, buf],  /too large/ ],
    ],
      function (fn, input) {
        uint[fn].apply(null, input)
      },
      { assert: 'throws' }
    )
})

test('uint: size', function (t) {
  t.equal(uint.size(0), 1)
  for (var i = 1; i <= 7; i++) {
    t.equal(uint.size(Math.pow(2, i * 7) - 1), i)
    t.equal(uint.size(Math.pow(2, i * 7)), i + 1)
        // console.log('# ' + (Math.pow(2, i * 7) - 1))
  }
  var maxInt = Math.pow(2, 53) - 1
  t.equal(uint.size(maxInt), 8)
  t.end()
})

test('uint: read with offset', function (t) {
  t.tableAssert([
    // input buffer               // value/offset expected
    [ 'a',                        'exp' ],
    [ [0, 0, 0, 0, 0],            [ 0, 1 ] ],
    [ [1, 0, 0, 0, 0],            [ 1, 1 ] ],
    [ [127, 0, 0, 0, 0],          [ 127, 1 ] ],
    [ [129, 0, 0, 0, 0],          [ 128, 2 ] ],
    [ [255, 127, 0, 0, 0],        [ 16383, 2 ] ],
    [ [129, 128, 0, 0, 0],        [ 16384, 3 ] ],
    [ [255, 255, 127, 0, 0],      [ 2097151, 3 ] ],
    [ [129, 128, 128, 0, 0],      [ 2097152, 4 ] ],
    [ [255, 255, 255, 127, 0],    [ 268435455, 4 ] ],
    [ [129, 128, 128, 128, 0],    [ 268435456, 5 ] ],
    [ [135, 255, 255, 255, 127],  [ 2147483647, 5 ] ]
  ], function (a) {
    var buf = new Uint8Array(a)
    var value_and_offset = []
    uint.read(buf, 0, value_and_offset)
    return value_and_offset
  })
})

test('uint: read', function (t) {
  t.tableAssert([
    // input buffer           // value/offset expected
    [ 'a', 'exp' ],
    [ [0, 0, 0, 0, 0], 0 ],
    [ [1, 0, 0, 0, 0], 1 ],
    [ [127, 0, 0, 0, 0], 127 ],
    [ [129, 0, 0, 0, 0], 128 ],
    [ [255, 127, 0, 0, 0], 16383 ],
    [ [129, 128, 0, 0, 0], 16384 ],
    [ [255, 255, 127, 0, 0], 2097151 ],
    [ [129, 128, 128, 0, 0], 2097152 ],
    [ [255, 255, 255, 127, 0], 268435455 ],
    [ [129, 128, 128, 128, 0], 268435456 ],
    [ [135, 255, 255, 255, 127], 2147483647 ],
  ], function (a) {
    return uint.read(new Uint8Array(a), 0)
  })
})

test('uint: write', function (t) {
  t.tableAssert([
    ['v',             'exp' ],
    [ 0,              [0, 0, 0, 0, 0] ],
    [ 1,              [1, 0, 0, 0, 0] ],
    [ 127,            [127, 0, 0, 0, 0] ],
    [ 128,            [129, 0, 0, 0, 0] ],
    [ 16383,          [255, 127, 0, 0, 0] ],
    [ 16384,          [129, 128, 0, 0, 0] ],
    [ 2097151,        [255, 255, 127, 0, 0] ],
    [ 2097152,        [129, 128, 128, 0, 0] ],
    [ 268435455,      [255, 255, 255, 127, 0] ],
    [ 268435456,      [129, 128, 128, 128, 0] ],
    [ 2147483647,     [135, 255, 255, 255, 127] ],
  ], function (v) {
    var buf = new Uint8Array(5)
    uint.write(v, buf, 0)
    return Array.prototype.slice.call(buf)
  })
})

test('uint: write with offset', function (t) {
  t.tableAssert([
        [ 'v',     'off',  'exp' ],
        [ 16383,   0,      [255, 127, 0, 0, 0, 0] ],
        [ 16383,   1,      [0, 255, 127, 0, 0, 0] ],
        [ 16383,   2,      [0, 0, 255, 127, 0, 0] ],
        [ 16383,   3,      [0, 0, 0, 255, 127, 0] ],
        [ 16383,   4,      [0, 0, 0, 0, 255, 127] ],
  ], function (v, off) {
    var buf = new Uint8Array(6)
    uint.write(v, buf, off)
    return Array.prototype.slice.call(buf)
  })
})
