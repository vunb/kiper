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

Main features
=============

* Keep objects and cache them in memory
* Keep an object with a timeout (TTL - time to live)
* Observe key if its value has any changed
* Add/listen a custom event

Usecases
========

* Cache object
* Observing the changes to an object
* Send and receive messages through events
* Create agents and manage them. Such as: `Chatbot manager`, `Dialog manager`, ...
* Etc, ...

API Usage
=========

Class: Kiper(options)
=======================
> The `Kiper` class is defined and exposed by the module `kiper`  
> Added in: `v0.0.1`  
> Options: 
> * **ttl**: (default: 0) - time to live in milliseconds. 0 = infinity
> * **checkPeriod**: (default: 600) - duration to check timeout on key has expired.
> * **checkUsage**: (default: true) - check the last time usage

```js
// create new instance of Kiper
const kiper = require('kiper').Kiper(options);
```

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
> Added in: `v1.0.0`  

```js
kiper.touch('foo');
```

Method: `.watch(key, callback)`
-------------------------------

> Watch a key, if its value changes then a callback will be called  
> Added in: `v1.0.0`  

```js
// keep an asset and return an obserable object 
let baz = kiper.keep('baz', {
    gold: 1000
});

// watch the key
kiper.watch('baz', (obj, oldVal, propkey, type) => {
    console.log('change info:', obj, oldVal, propkey, type);
    // change info: { gold: 999 } 1000 gold update
    // change info: { silver: 1000 } undefined silver add
    // change info: {} 999 gold delete
});

// baz lost one gold
baz.gold = 999
// baz has new silvers
baz.silver = 1000
// baz lost all golds
delete baz.gold
```

Method: `.on(event, listener)`
-------------------------------

> Listen an event which emit from kiper  
> Added in: `v1.0.0`  

```js
kiper.keep('foo', 'bar', 1000);
kiper.on('expired', (value, key) => {
    console.log('A timeout on key has expired', value, key);
    // A timeout on key has expired bar foo
})
```

Method: `.once(event, listener)`
-------------------------------

> Listen an event once which emit from kiper  
> Added in: `v1.0.0`  

```js
kiper.keep('foo', 'bar', 1000);
kiper.once('expired', (value, key) => {
    console.log('A timeout on key has expired', value, key);
    // A timeout on key has expired bar foo
})
```

License
=======

MIT