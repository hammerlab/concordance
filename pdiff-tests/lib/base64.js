// This file was cobbled together from a stack overflow answer and
// http://jsperf.com/native-base64-vs-pure-js.

var Base64 = {

  /* Convert data (an array of integers) to a Base64 string. */
  toBase64Table: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  base64Pad: '=',

  encode: function(data) {
    "use strict";
/*
      if (window.btoa) {
        return window.btoa(data);
      }
      */

    var result = '',
        chrTable = Base64.toBase64Table.split(''),
        pad = Base64.base64Pad,
        length = data.length,
        iterLength = length - 2,
        lengthMod3 = length % 3,
        i;
    // Convert every three bytes to 4 ascii characters.
    for (i = 0; i < iterLength; i += 3) {
      result += chrTable[data[i] >> 2];
      result += chrTable[((data[i] & 0x03) << 4) + (data[i + 1] >> 4)];
      result += chrTable[((data[i + 1] & 0x0f) << 2) + (data[i + 2] >> 6)];
      result += chrTable[data[i + 2] & 0x3f];
    }

    // Convert the remaining 1 or 2 bytes, pad out to 4 characters.
    if (lengthMod3) {
      i = length - lengthMod3;
      result += chrTable[data[i] >> 2];
      if (lengthMod3 === 2) {
        result += chrTable[((data[i] & 0x03) << 4) + (data[i + 1] >> 4)];
        result += chrTable[(data[i + 1] & 0x0f) << 2];
        result += pad;
      } else {
        result += chrTable[(data[i] & 0x03) << 4];
        result += pad + pad;
      }
    }

    return result;
  },

  /* Convert Base64 data to a string */
  toBinaryTable: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, 0, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1],

  decode: function(data, offset) {
    "use strict";
/*
      if (window.atob) {
        return window.atob(data.substr(offset));
      }
      */

    offset = typeof(offset) !== 'undefined' ? offset : 0;
    var binTable = Base64.toBinaryTable,
        pad = Base64.base64Pad,
        result, result_length, idx, i, c, padding, leftbits = 0,
        
        // number of bits decoded, but yet to be appended
        leftdata = 0,
        
        // bits decoded, but yet to be appended
        data_length = data.indexOf('=') - offset,
        length = data.length;

    if (data_length < 0) {
      data_length = data.length - offset;
    }

    /* Every four characters is 3 resulting numbers */
    result_length = (data_length >> 2) * 3 + Math.floor((data_length % 4) / 1.5);
    result = new Array(result_length);

    // Convert one by one.
    for (idx = 0, i = offset; i < length; i++) {
      c = binTable[data.charCodeAt(i) & 0x7f];
      padding = (data.charAt(i) === pad);
      // Skip illegal characters and whitespace
      if (c === -1) {
        console.error("Illegal character '" + data.charCodeAt(i) + "'");
        continue;
      }

      // Collect data into leftdata, update bitcount
      leftdata = (leftdata << 6) | c;
      leftbits += 6;

      // If we have 8 or more bits, append 8 bits to the result
      if (leftbits >= 8) {
        leftbits -= 8;
        // Append if not padding.
        if (!padding) {
          result[idx++] = (leftdata >> leftbits) & 0xff;
        }
        leftdata &= (1 << leftbits) - 1;
      }
    }

    // If there are any bits left, the base64 string was corrupted
    if (leftbits) {
      throw {
        name: 'Base64-Error',
        message: 'Corrupted base64 string'
      };
    }

    return result;
  },

  decodeToString: function(data, offset) {
    var arr = Base64.decode(data, offset);
    var arrayToStr = function(arr) {
      var parts = [];
      var blockSize = 65000;
      for (var i = 0; i < arr.length; i += blockSize) {
        parts.push(String.fromCharCode.apply(null, arr.slice(i, i + blockSize)));
      }
      return parts.join('');
    };
    return arrayToStr(arr);
  },

  'base64ArrayBuffer': function (arrayBuffer) {
    var base64    = ''
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

    var bytes         = new Uint8Array(arrayBuffer)
    var byteLength    = bytes.byteLength
    var byteRemainder = byteLength % 3
    var mainLength    = byteLength - byteRemainder

    var a, b, c, d
    var chunk

    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
      // Combine the three bytes into a single integer
      chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

      // Use bitmasks to extract 6-bit segments from the triplet
      a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
      b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
      c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
      d = chunk & 63               // 63       = 2^6 - 1

      // Convert the raw binary segments to the appropriate ASCII encoding
      base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
      chunk = bytes[mainLength]

      a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

      // Set the 4 least significant bits to zero
      b = (chunk & 3)   << 4 // 3   = 2^2 - 1

      base64 += encodings[a] + encodings[b] + '=='
    } else if (byteRemainder == 2) {
      chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

      a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
      b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4

      // Set the 2 least significant bits to zero
      c = (chunk & 15)    <<  2 // 15    = 2^4 - 1

      base64 += encodings[a] + encodings[b] + encodings[c] + '='
    }

    return base64
  }

};

module.exports = Base64;
