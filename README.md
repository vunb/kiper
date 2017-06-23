# kiper
Keep objects available everywhere in nodejs application

[![npm version](https://img.shields.io/npm/v/kiper.svg?style=flat)](https://www.npmjs.com/package/kiper)
[![Travis](https://travis-ci.org/vunb/kiper.svg?branch=master)](https://travis-ci.org/vunb/kiper)

How to use
==========

First you need to install `kiper` using npm:

```bash
npm install kiper --save
```

Then, use kiper in your project:

```js
const kiper = require('kiper');

// somewhere keep an asset
kiper.keep('foo', 'bar');

// somewhere you got it back
let value = kiper.get('foo');
console.log(value);

```

API Usage
=========

Method: `.keep(key: string, value: object)`
-------------------------------

> Keep an object in kiper  
> Added in: `v0.0.1`  
> Alias: `set`

```js
kiper.keep('foo', 'bar');
```

Method: `.keep(key: string, value: object, ttl: int, timeout: function)`
-------------------------------

> Keep an object for a period of time  
> Added in: `v0.1.0`  
> Alias: `set`

```js
kiper.keep('foo', 'bar', 1000, console.log);
// output: bar foor
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

Method: `.remove(key: string)`
-------------------------------

> Remove an object out of kiper  
> Added in: `v0.1.0`  

```js
kiper.remove('foo');
// returns: bar
```

Method: `.retire()`
-------------------------------

> Stop interval checking, free memory and release objects  
> Added in: `v0.1.0`  

```js
kiper.retire();
```

Method: `.touch(key)`
-------------------------------

> Repair the last time usage  
> Added in: `v0.1.1`  

```js
kiper.touch('foo');
```

License
=======

MIT