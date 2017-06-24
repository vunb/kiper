var kiper = require('./index');

let foo = kiper.keep('foo', () => 1);
let baz = kiper.keep('baz', { gold: 1000 });

console.log(kiper.get('foo')());

kiper.watch('baz', (value, oldValue, propkey, type) => {
    console.log('watch got: ', value, oldValue, propkey, type);
})

// take one gold
baz.gold = 999;

kiper.retire();