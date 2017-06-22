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

API Usage
=========

Method: `.keep(key: string, value: object)`
-------------------------------

> Keep an object in kiper  
> Added in: `v0.0.1`  
> Alias: `.set(key, value)`

```js
kiper.keep('foo', 'bar');
```

Method: `.get(key: string)`
-------------------------------

> Get an object from kiper  
> Added in: `v0.0.1`

```js
kiper.get('foo');
// returns: bar
```

Method: `.get(validator: function)`
-------------------------------

> Get an object from kiper by pass a validator function  
> Added in: `v0.0.2`

```js
kiper.get((value, key) => value === 'bar');
// returns: bar
```

License
=======

MIT