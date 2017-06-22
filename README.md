# kiper
Keep objects available everywhere in nodejs application

[![npm version](https://img.shields.io/npm/v/kiper.svg?style=flat)](https://www.npmjs.com/package/kiper)

How to use
==========

First you need to install `kiper` using npm:

```bash
npm install kiper --save
```

Then, use kiper in your project:

```js
const kiper = require('kiper');

// somewhere keep 
kiper.keep('foo', 'bar');

// somewhere you got it
let value = kiper.get('foo');
console.log(value);

```

License
=======

MIT