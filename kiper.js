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

        if (this.options.checkPeriod > 0) {
            this._timer = setInterval(() => {
                for (let [name, obj] of this._helper) {
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
            this._helper.delete(obj.key);
            this.emit('expired', value, obj.key, obj);
            obj.cb(value, obj.key, obj);
        }
    }

    /**
     * Get an object from kiper
     * @param {string} key a key holder or validator function
     */
    get(key) {
        if (typeof key === 'function') {
            for (let [name, value] of this._store.entries()) {
                if (key(value, name)) {
                    return value;   
                }
            }
        } else {
            return this._store.get(key);
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
        this._store.set(key, value);
    }

    /**
     * Keep an object in kiper
     * @param {string} key 
     * @param {object} value 
     */
    keep(key, value, ttl, cb) {
        let timeout;
        if (!ttl) {
            this._store.set(key, value);
        } else if (typeof ttl === 'number' && ttl > 0) {
            this._store.set(key, value);
            this._helper.set(key, {
                ttl: ttl,
                key: key,
                cb: cb || (() => 1),
                lastUsage: Date.now()
            });
        }
    }

    /**
     * Remove an object out of kiper
     * @param {string} key 
     */
    remove(key) {
        let item = this.get(key);
        this._store.delete(key);
        return item;
    }

    /**
     * Stop interval, free memory
     */
    retire() {
        clearInterval(this._timer);
        this._store.clear();
        this._helper.clear();
    }
}

module.exports = Kiper;