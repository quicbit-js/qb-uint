# qb-uint

Variable-length encoding of unsigned integers using 7-bit chaining

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

Chained unsigned integers use 7 bits of every byte for the integer content and the most significant bit to indicate additional bytes:

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


