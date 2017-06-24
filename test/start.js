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
    t.equal(kiper.get('foo'), 'bar', 'get a non-object value');
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

    kiper.once('expired', (value, key) => {
        t.pass('got event expired on key');
    })
});


test('Should repair a key once time', (t) => {
    t.plan(1);

    let start = Date.now();
    kiper.keep('baz', 100, 1000, (value, key) => {
        let longtime = Date.now() - start;
        t.ok(longtime > 1500 && longtime < 2001, 'baz has repaired for once time');
    });

    setTimeout(() => kiper.touch('baz'), 500);
});

test('Observe an object and notify on value of the item is changed', (t) => {
    t.plan(5);

    // check 2 times
    t.throws(() => kiper._observe(123, console.log), /TypeError/, 'Should throw typeError if not pass an object');
    t.throws(() => kiper._observe({}), /function/,'Should throw an error if missing a callback');

    // keep an asset here
    let baz = kiper.keep('baz', {
        gold: 1000
    });

    kiper.watch('baz', (obj, oldVal, propkey, type) => {
        if (type === 'update') {
            t.equal(obj[propkey] - oldVal, -1, 'lost one gold!');
        } else if (type === 'add') {
            t.equal(obj['silver'], 1000, 'new prop should be added');
        } else if (type === 'delete') {
            t.equal(typeof obj['gold'], 'undefined', 'baz should be undefined after delete');
        } else {
            t.fail('do not know change type:', obj, oldVal, propkey, type);
        }
    });

    // check 3 times: change value in somewhere
    setTimeout(() => baz.gold = 999, 1000);
    setTimeout(() => delete baz.gold, 1000);
    setTimeout(() => baz.silver = 1000, 1000);

});

test('Kiper retire', (t) => {
    // stop testing
    kiper.retire();
    t.end();
});