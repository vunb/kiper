const events = require('events');

/**
 * Kiper: Keep objects available everywhere in nodejs application
 */
class Kiper extends events {
    constructor(options) {
        super();
        this._store = new Map();
        this._helper = new Map();
        this._timer = null;

        this.options = {
            // default time to live in seconds. 0 = infinity;
            ttl: 0,
            // time in seconds to check all data and delete expired keys
            checkPeriod: 600,
            checkUsage: true
        }

        // override default
        this.options = Object.assign(this.options, options);

        // bind has method into kiper
        this.has = this._store.has.bind(this._store);

        var self = this;
        if (this.options.checkPeriod > 0) {
            this._timer = setInterval(() => {
                for (let [name, obj] of self._helper) {
                    this._check(obj);
                }
            }, this.options.checkPeriod);
        }

    }

    _check(obj, cb) {
        let lastTime = obj.createAt;

        if (this.options.checkUsage) {
            lastTime = obj.lastUsage;
        }

        if (obj.ttl > 0 && Date.now() - lastTime > obj.ttl) {
            let value = this.remove(obj.key);
            this.emit('expired', value, obj.key, obj);
            obj.cb(value, obj.key, obj);
        }
    }

    _observe(obj, cb) {
        if (Object(obj) !== obj) {
            throw new TypeError('target must be an Object, given ' + obj);
        }

        if (typeof cb !== 'function') {
            throw 'observer must be a function, given ' + cb;
        }

        return new Proxy(obj, {
            set(target, key, value, receiver) {
                let oldVal = target[key];

                // do not send anything if value did not change.
                if (oldVal === value) return;

                // define change type;
                let type = oldVal === undefined ? 'add' : 'update';

                let info = {
                    object: target,
                    oldValue: oldVal,
                    name: key,
                    type: type,
                };

                // set prop value on target
                target[key] = value;
                cb(info.object, info.oldValue, info.name, info.type);
                // must return true, see: https://goo.gl/KuR8QW
                return true;
            },

            deleteProperty(target, key, receiver) {
                // do not send change if key does not exist.
                if (!(key in target)) return;

                let info = {
                    object: target,
                    oldValue: target[key],
                    name: key,
                    type: 'delete'
                };

                // remove property.
                delete target[key];
                cb(info.object, info.oldValue, info.name, info.type);
                return true;
            }
        });

    }

    /**
     * Get an object from kiper
     * @param {string} key a key holder or validator function
     */
    get(key) {
        if (typeof key === 'function') {
            for (let [name, value] of this._store) {
                if (key(value, name)) {
                    this.touch(name);
                    return value;
                }
            }
        } else if (this.has(key)) {
            this.touch(key);
            return this._store.get(key);
        } else {
            return undefined;
        }
    }

    /**
     * Alias: set
     * @param {string} key 
     * @param {object} value 
     */
    set(key, value) {
        if (/^__kiper__/.test(key)) {
            throw new TypeError('Key starts with prefix: __kiper__');
        }
        // its okay
        this.keep.apply(this, arguments);
    }

    /**
     * Keep an object in kiper
     * @param {string} key 
     * @param {object} value 
     */
    keep(key, value, ttl, cb) {
        this.remove(key);
        this._store.set(key, value);
        this._helper.set(key, {
            ttl: ttl,
            key: key,
            cb: cb || (() => 1),
            lastUsage: Date.now()
        });
    }

    /**
     * Remove an object out of kiper
     * @param {string} key 
     */
    remove(key) {
        let item = this.has(key) && this.get(key);
        this._store.delete(key);
        this._helper.delete(key);
        return item;
    }

    /**
     * Stop interval, free memory and release objects
     */
    retire() {
        clearInterval(this._timer);
        this._store.clear();
        this._helper.clear();
    }

    /**
     * Repair the last time usage
     * @param {*} key 
     */
    touch(key) {
        if (this._helper.has(key)) {
            this._helper.get(key).lastUsage = Date.now();
        }
    }

    /**
     * Observe value of key
     * @param {*} key 
     * @param {function} cb callback when value of key is changed
     */
    watch(key, cb) {
        let value = this.get(key);
        return this._observe(value, cb);
    }
}

module.exports = Kiper;