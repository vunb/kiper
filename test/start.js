'use strict';
const test = require('tape');
const kiper = require('..');

test('Keep a simple value', (t) => {
    t.plan(2);

    // kiper collects some items
    kiper.keep('foo', 'bar');
    kiper.set('baz', {
        gold: 1000
    });

    // kiper should has its items
    t.equal(kiper.get('foo'), 'bar');
    t.equal(typeof kiper.get('baz'), 'object', 'keep an object in kiper');
});

test('Should not throw an exception', (t) => {
    t.plan(1);

    t.doesNotThrow(() => kiper.set('__handsomekey__', 1), /Error/, 'Should not throw any Error');
});

test('Should throw an exception', (t) => {
    t.plan(1);

    t.throws(() => kiper.set('__kiper__'), /TypeError/, 'Should throw typeError');
});

test('Should return the first value in the kiper that satisfies', (t) => {
    t.plan(1);

    let asset = kiper.get((value, key) => value === 'bar');
    t.equal(asset, 'bar');
});

test('Should remove an asset from kiper', (t) => {
    t.plan(1);

    kiper.remove('baz');
    t.notOk(kiper.get('baz'), 'baz has gone');
});

test('Should emit an event expired on key', (t) => {
    t.plan(2);

    kiper.keep('baz', 100, 1000, (value, key) => {
        t.pass('callback at timeout');
    });

    kiper.on('expired', (value, key) => {
        t.pass('got event expired on key');
    })
});

test('Observe an object and notify on value of the item is changed', (t) => {
    t.plan(6);

    // check 2 times
    t.throws(() => kiper._observe('fake', 123, console.log), /TypeError/, 'Should throw typeError if not pass an object');
    t.throws(() => kiper._observe('fake', {}), /function/,'Should throw an error if missing a callback');

    // keep an asset
    kiper.keep('baz', {
        gold: 1000
    });

    let baz = kiper.watch('baz', (obj, oldVal, prop, type) => {
        if (type === 'update') {
            t.equal(obj[prop] - oldVal, -1, 'lost one gold!');
        } else if (type === 'add') {
            t.equal(obj['silver'], 1000, 'new prop should be added');
        } else if (type === 'delete') {
            t.notOk(obj['baz'], 'baz should be undefined after delete');
        }
    });

    // change value in somewhere
    // check 3 times
    setTimeout(() => baz.gold = 999, 1000);
    setTimeout(() => delete baz.gold, 1000);
    setTimeout(() => baz.silver = 1000, 1000);

    t.ok(kiper.get('baz').silver, 'baz has silver its own');
});

test('Kiper retire', (t) => {
    // stop testing
    kiper.retire();
    t.end();
});