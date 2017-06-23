'use strict';
const test = require('tape');
const kiper = require('..');

test('Keep a simple value', (t) => {
    t.plan(2);

    // kiper collects some items
    kiper.set('foo', 'bar');
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

test('Kiper retire', (t) => {
    // stop testing
    kiper.retire();
    t.end();
});