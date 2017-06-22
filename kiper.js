/**
 * Kiper
 * Keep objects available everywhere in nodejs application
 */
class Kiper extends Map {
    constructor(data) {
        super();
        this.self = this;
    }

    /**
     * Get an object from kiper
     * @param {string} key a key holder or validator function
     */
    get(key) {
        if (typeof key === 'function') {
            for (var [name, value] of this.entries()) {
                if (key(value, name)) {
                    return value;   
                }
            }
        } else {
            return super.get(key);
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
        super.set(key, value);
    }

    /**
     * Keep an object in kiper
     * @param {string} key 
     * @param {object} value 
     */
    keep(key, value) {
        this.set(key, value);
    }
}

module.exports = Kiper;