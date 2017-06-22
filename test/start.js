'use strict';
const test = require('tape');
const kiper = require('..');

test('Keep a simple value', function (t) {
    t.plan(2);

    // kiper collects some items
    kiper.set('foo', 'bar');
    kiper['bar'] = 'baz';

    // kiper should has its items
    t.equal(kiper.get('foo'), 'bar');
    t.equal(kiper['bar'], 'baz');
});

test('Should not throw an exception', function (t) {
    t.plan(1);

    t.doesNotThrow(() => kiper.set('__handsomekey__', 1), /Error/, 'Should not throw any Error');
});

test('Should throw an exception', function (t) {
    t.plan(1);

    t.throws(() => kiper.set('__kiper__'), /TypeError/, 'Should throw typeError');
});

test('Should return the first value in the kiper that satisfies', function (t) {
    t.plan(1);

    let asset = kiper.get((value, key) => value === 'bar');
    t.equal(asset, 'bar');
});
