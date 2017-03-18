# qb-uint

[![npm][npm-image]][npm-url]
[![downloads][downloads-image]][npm-url]
[![bitHound Dependencies][proddep-image]][proddep-link]
[![dev dependencies][devdep-image]][devdep-link]
[![code analysis][code-image]][code-link]

[npm-image]:       https://img.shields.io/npm/v/qb-uint.svg
[downloads-image]: https://img.shields.io/npm/dm/qb-uint.svg
[npm-url]:         https://npmjs.org/package/qb-uint
[proddep-image]:   https://www.bithound.io/github/quicbit-js/qb-uint/badges/dependencies.svg
[proddep-link]:    https://www.bithound.io/github/quicbit-js/qb-uint/master/dependencies/npm
[devdep-image]:    https://www.bithound.io/github/quicbit-js/qb-uint/badges/devDependencies.svg
[devdep-link]:     https://www.bithound.io/github/quicbit-js/qb-uint/master/dependencies/npm
[code-image]:      https://www.bithound.io/github/quicbit-js/qb-uint/badges/code.svg
[code-link]:       https://www.bithound.io/github/quicbit-js/qb-uint

Variable-length encoding of unsigned integers using 7-bit chaining

**Complies with the 100% test coverage and minimum dependency requirements** of 
[qb-standard](http://github.com/quicbit-js/qb-standard) . 

# Install

    npm install qb-uint
    
# Example

qb-uint stores integers quickly in compact byte form:

    var uint = require('qb-uint')
    
    var buf = new Uint8Array(9)
    var off = 0
    
    // store some integers...
    off += uint.write(buf, off, 1)
    off += uint.write(buf, off, 2)
    off += uint.write(buf, off, 127)
    off += uint.write(buf, off, 524)
    off += uint.write(buf, off, 2032)
    off += uint.write(buf, off, 16001)
    
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
    
Gives the output:

    wheee.... 6 integers stored in 9 bytes:  Uint8Array [ 1, 2, 127, 132, 12, 143, 112, 253, 1 ]
    values returned: [ 1, 2, 127, 524, 2032, 16001 ]
    byte sizes were: 1,1,1,2,2,2

# API

## API Update 1.x -> 2.x

If you were using versions 1.x, please note that the API has changed to comply with 
quicbit naming conventions for a better over-all experience:

1. Parameter names have changed to [src][src-link], [dst][dst-link],
and [off][off-link] which are described in the [glossary][glossary-link].
2. Write now returns the **absolute** offset instead of the number of bytes
written, which is consistent with offset in the read() holder parameter.



[glossary-link]: https://github.com/quicbit-js/qb-standard/blob/master/doc/variable-glossary.md
[src-link]: https://github.com/quicbit-js/qb-standard/blob/master/doc/variable-glossary.md#src-source
[off-link]: https://github.com/quicbit-js/qb-standard/blob/master/doc/variable-glossary.md#off-offset
[dst-link]: https://github.com/quicbit-js/qb-standard/blob/master/doc/variable-glossary.md#dst-destination

## read([src][src-link], [off][off-link], holder)

Read an integer from the given array or buffer at the given offset.  If a holder (array) is provided,
the value and the offset of the next integer will be populated into the array provided
as [integer, offset].  The holder is just an efficient means to pass these
two pieces of information by value.  If the holder is not provided, the integer value
will be returned (but not the updated offset).

## write([dst][dst-link], [off][off-link], value)

Write an integer value to the given array or buffer at the given offset.  Return
the offset where the next integer should be written (incremented by number of bytes
written).  For example, to encode numbers 16,000 through 17,000 into an array, 
update the offset like so:
    
    var write = require('qb-uint').write
    var off = 0
    var buf = []
    for(var n = 16000; n < 17000; n++) {
      off = write(buf, off, n)
    } 
    
Note that for some numbers, offset was increasing by 2 and for others, it was increasing
by 3, depending on how many bytes were required.

# Why 7-Bit Encoding?
7-bit encoding has some appealing serialization properties:

1. 8-bit-aligned, and so aligned with systems and languages, albeit with  
   [some exceptions](https://en.wikipedia.org/wiki/UNIVAC_I))

1. Compact storage for small integers:
 
       1 byte for integers < 128              1<<7
       2 bytes for integers < 16,348          1<<14
       3 bytes for integers < 2,097,152       1<<21
       4 bytes for integers < 268,435,456     1<<28
       ...                                    1<<35
       ...
   
   This is especially useful when working with lots of small values.  Note that 
   with techniques like [differential encoding](https://en.wikipedia.org/wiki/Differential_coding),
   on large data sets, the efficiency of small integers become hugely important.

1. Unlimited value representation.  Variable integers can represent
   values of any length\*.  Even though for every 8 bytes written, 1 bytes is sacrificed, 
   but for the occasional huge value intermixed with many smaller values, 
   uint encoding is a great fit.  Again, differential encoding on most data sets
   can bring values down to the 1-4 byte range.
   
\* Though values of any length can be encoded, javascript limits integers to 2^53-1.
To extract any-size values requires extra handling not included here.  Look at 
Google's Long implementation as an example of how to handle larger values.


## About Bounds Checking

These functions use plain array access notation buf[x], which is fastest
for working with arrays and buffers, but it does not perform any bounds checking.  
So beware that writing past end-of-buffer on a Uint8Array will silently do nothing.

## The 7-bit Chaining Algorithm

Chained unsigned integers use 7 bits of every byte for the integer content and the most 
significant bit to indicate additional bytes.  We encode most significant
bits in lower byte addresses - like big-endian, but with left-most bit indicating 
the span:

```
00000000                           0
00000001                           1
01111111                         127
10000001 00000000                256
10000001 00000000 0000001   2^15 + 1
```

In theory, chained integers can be used to represent any-size integer, but in practice, most languages and parsers
are limited to 2^128, and
javascript limits to 2^53-1.
Special classes or functions are sometimes used to handle larger int math such as Google's Long


