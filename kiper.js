const events = require('events');

/**
 * Kiper: Keep objects available everywhere in nodejs application
 */
class Kiper extends events.EventEmitter {
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

        this.on('newListener', (event, listener) => {
            console.log('new event added: ', event);
        });

        this.on('removeListener', (event, listener) => {
            console.log('an event removed: ', event);
        });
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

        var self = this;
        return new Proxy(obj, {
            get(target, propkey, receiver) {
                if (typeof propkey === 'string' && /toObject/.test(propkey)) {
                    return () => target['$isWrapped'] ? target.value : target;
                } else {
                    return target[propkey];
                }
            },
            set(target, propkey, value, receiver) {
                let oldVal = target[propkey];

                // do not send anything if value did not change.
                if (oldVal === value) return;

                // define change type;
                let type = oldVal === undefined ? 'add' : 'update';

                let loginfo = {
                    object: target,
                    oldValue: oldVal,
                    propkey: propkey,
                    type: type,
                };


                // set prop value on target
                target[propkey] = value;
                cb(loginfo);
                // must return true, see: https://goo.gl/KuR8QW
                return true;
            },

            deleteProperty(target, propkey, receiver) {
                // do not send change if prop does not exist.
                if (!(propkey in target)) return;

                let loginfo = {
                    object: target,
                    oldValue: target[propkey],
                    propkey: propkey,
                    type: 'delete'
                };

                // remove property.
                delete target[propkey];
                cb(loginfo);
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
                let rawValue = value['$isWrapped'] ? value.value : target
                if (key(rawValue, name)) {
                    this.touch(name);
                    return rawValue;
                }
            }
        } else if (this.has(key)) {
            let value = this._store.get(key);
            this.touch(key);
            return value['$isWrapped'] ? value.value : value;
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
        let wrapper = (() => {
            if (typeof value !== 'object') {
                return {
                    $isWrapped: true,
                    value: value
                }
            } else {
                return value;
            }
        })();

        let observable = this._observe(wrapper, (log) => {
            this.emit(key, log.object, log.oldValue, log.propkey, log.type);
        });

        this.remove(key);
        this._store.set(key, observable);
        this._helper.set(key, {
            ttl: ttl,
            key: key,
            cb: cb || (() => 1),
            lastUsage: Date.now()
        });
        return observable;
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
        if (this.has(key)) {
            this.on(key, cb);
        }
    }
}

module.exports = Kiper;