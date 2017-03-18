// Variable Length Integer
'use strict'

// Functions
// ====
//
// In Chrome (42.0.2311.152), this switch statement is roughly 4x faster than calculating: ~~((log2/Math.log(v))/7)
function size (v) {
  if (v < 0) {
    throw Error('unsigned int cannot be negative: ' + v)
  }
  if (v < 0x80) {
    return 1
  } else if (v < 0x4000) {
    return 2
  } else if (v < 0x200000) {
    return 3
  } else if (v < 0x10000000) {
    return 4
  } else if (v < 0x800000000) {
    return 5
  } else if (v < 0x40000000000) {
    return 6
  } else if (v < 0x2000000000000) {
    return 7
  } else if (v > 0x1fffffffffffff) {
    throw Error('unsigned int cannot be greater than max safe integer: ' + v)
  } else if (isNaN(v)) {
    throw Error('cannot convert ' + v + ' to bytes')
  } else {
        /* v is between 2^49 and max safe integer */
    return 8
  }
}

// write an integer to the given buffer encoded with 7-bit chaining
function write (dst, off, v) {
  if (v > 0x7FFFFFFF) {  // max positive value for signed int
    throw Error('number too large for 32 bit conversion')   // todo: handle up to Number.MAX_SAFE_INTEGER
  } else {
    var n = size(v)
    dst[off + n - 1] = v & 0x7F          // least-significant 7 bits (no chain)
    for (var i = n - 2; i >= 0; i--) {
      v >>= 7
      dst[off + i] = (v & 0x7F) | 0x80 // next 7 bits with chain flag
    }
  }
  return n + off
}

// Read an integer value from a buffer at the given offset
//
// If h is given (a holder array), then write the integer value and the
// new buffer offset into the array at h[0] and h[1].
// If h is not given, just return the integer value.
function read (src, off, h) {
  var noff = off
  var p = src[noff++]
  var v = p & 0x7F        // put low-order 7 bits
  while (p & 0x80) {       // check hi bit
    v <<= 7
    p = src[noff++]
    v |= (p & 0x7F)     // put low-order 7 bits
  }
  if (h) {
    h[0] = v
    h[1] = noff
  } else {
    return v
  }
}

module.exports = {
  write: write,
  read: read,
  size: size
}
