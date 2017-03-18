var uint = require('.')

var buf = new Uint8Array(9)
var off = 0

// store some integers...
off = uint.write(buf, off, 1)
off = uint.write(buf, off, 2)
off = uint.write(buf, off, 127)
off = uint.write(buf, off, 524)
off = uint.write(buf, off, 2032)
off = uint.write(buf, off, 16001)
console.log('wheee.... 6 integers stored in 9 bytes: ', buf)

// read them back...
var holder = []           // holds integer value and updated offset (at 0 and 1).
off = 0
var values = []
while (off < buf.length) {
  uint.read(buf, off, holder)
  values.push(holder[0])  // value
  off = holder[1]         // value length
}

console.log('values returned:', values)

var sizes = values.map(function(v) { return uint.size(v) })
console.log('byte sizes were: ' + sizes)
