// umd паттерн для экспорта библиотеки
// https://github.com/umdjs/umd/blob/master/templates/returnExports.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else if (!root.Promise) {
        // Browser globals (root is window)
        root.Promise = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    const STATES = {
        PENDING: 'pending',
        FULFILLED: 'fulfilled',
        REJECTED: 'rejected'
    };

    const nextTick = getNextTick();

    /* конструктор */
    function Promise(executor) {
        // TODO Включить проверку типа для executor
        // Но в таком случае не будут проходить compliance тесты
        // на соответствие promise/a+
        // Поэтому пока для тестов введен дополнительный флаг
        if (Promise.strict) {
            handleTypeOfExecutorError(executor);
        }

        this.queue = [];
        this.state = STATES.PENDING;
        this.value = undefined;

        this.resolve = this.resolve.bind(this);
        this.reject = this.reject.bind(this);

        if (typeof executor === 'function') {
            try {
                executor(this.resolve, this.reject);
            } catch (error) {
                this.reject(error);
            }
        }
    }

    /**
     * Зареджектить промис с определенным reason
     * @private
     */
    Promise.prototype.reject = function(reason) {
        if (this.state !== STATES.PENDING) {
            return;
        }
        this.state = STATES.REJECTED;
        this.value = reason;
        return this.runHandlerQueue();
    };

    /**
     * Зарезолвить промис с переданным значением
     * @private
     */
    Promise.prototype.resolve = function(value) {
        if (this.state !== STATES.PENDING) {
            return;
        }
        if (value === this) {
            this.reject(new TypeError('Promise and value are equal'));
            return;
        }
        const [resolve, reject] = once(this.resolve, this.reject);
        try {
            let then = getIfThenable(value);
            if (then) {
                then(resolve, reject);
            } else {
                this.state = STATES.FULFILLED;
                this.value = value;
                this.runHandlerQueue();
            }
        } catch(err) {
            reject(err);
        }
    };

    /**
     * @private
     */
    Promise.prototype.runHandlerQueue = function() {
        const { state, queue, value } = this;
        if (state === STATES.PENDING) {
            return;
        }
        nextTick(function() {
            while (queue.length > 0) {
                const nextThenPromise = queue.shift();
                let handler;
                if (state === STATES.FULFILLED) {
                    handler = nextThenPromise.onFulfilled || defaultOnFulfilled;
                } else if (state === STATES.REJECTED) {
                    handler = nextThenPromise.onRejected || defaultOnRejected;
                }
                let returnValue;
                try {
                    returnValue = handler(value);
                } catch (err) {
                    nextThenPromise.reject(err);
                    continue;
                }
                nextThenPromise.resolve(returnValue);
            }
        });
    };

    Promise.prototype.then = function(onFulfilled, onRejected) {
        const next = new Promise();
        if (typeof onFulfilled === 'function') {
            next.onFulfilled = onFulfilled;
        }
        if (typeof onRejected === 'function') {
            next.onRejected = onRejected;
        }
        this.queue.push(next);
        this.runHandlerQueue();
        return next;
    };

    Promise.prototype.catch = function(onRejected) {
        return this.then(null, onRejected);
    };

    /**
     * Метод finally() возвращает Promise. Когда Promise (обещание) был выполнен, в не зависимости
     * успешно или с ошибкой, указанная функция будет выполнена.
     * https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally
     * @param onFinally
     */
    Promise.prototype.finally = function(onFinally) {
        if (typeof onFinally !== 'function') {
            return this;
        }
        return this.then(function(value) {
            onFinally();
            return value;
        }, function(reason) {
            onFinally();
            throw reason;
        });
    };

    /**
     * http://bluebirdjs.com/docs/api/done.html
     */
    Promise.prototype.done = function(onFulfilled, onRejected) {
        return this.then(onFulfilled, onRejected).then(null, function(err) {
            setTimeout(function() { throw err }, 0);
        });
    };

    Promise.resolve = function(value) {
        return new Promise(function(resolve) {
            resolve(value);
        });
    };

    Promise.reject = function(reason) {
        return new Promise(function(_, reject) {
            reject(reason);
        });
    };

    /**
     * Promise.all возвращает массив значений от всех обещаний, которые были ему переданы.
     * Возвращаемый массив значений сохраняет порядок оригинального перечисляемого объекта,
     * но не порядок выполнения обещаний.
     * https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
     * @param promises
     * @returns {Promise}
     */
    Promise.all = function(promises) {
        return new Promise(function(resolve, reject) {
            let counter = 0;
            const results = [];
            for (let i = 0; i < promises.length; i++) {
                const promise = promises[i];
                promise.then(function(value) {
                    counter++;
                    results[i] = value;
                    if (counter === promises.length) {
                        resolve(results);
                    }
                }).catch(reject);
            }
        });
    };

    /**
     * Метод race  возвращает Обещание (Promise) с результатом, первого завершенного
     * из переданных обещаний. Т.е. возвратит resolve или reject, в зависимости
     * от того, что случится первым.
     * https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise/race
     * @param promises
     * @returns {Promise}
     */
    Promise.race = function(promises) {
        return new Promise(function(resolve, reject) {
            for (let i = 0; i < promises.length; i++) {
                const promise = promises[i];
                promise.then(resolve).catch(reject);
            }
        });
    };

    /**
     * Для запуска compliance тестов из promise/a+
     */
    Promise.deferred = function() {
        let resolver, rejecter;
        const promise = new Promise(function(resolve, reject) {
            resolver = resolve;
            rejecter = reject;
        });
        return {
            promise,
            resolve: function(value) {
                return resolver(value);
            },
            reject: function(reason) {
                return rejecter(reason);
            }
        };
    };

    // **** **** **** **** **** **** **** **** **** **** **** **** ****
    // UTILITES
    // **** **** **** **** **** **** **** **** **** **** **** **** ****

    /**
     * Обработка неверного типа параметра executor конструктора промисов
     * @param executor
     */
    function handleTypeOfExecutorError(executor) {
        switch (typeof executor) {
            case "undefined":
            case "number":
            case "string":
            case "boolean":
                throw new TypeError(`Promise resolver ${executor} is not a function`);
            case "object":
            case "symbol":
                let type;
                if (executor === null) {
                    type = null;
                } else if (Array.isArray(executor)) {
                    type = "Array"
                } else {
                    type = Object.prototype.toString.call(executor);
                }
                throw new TypeError(`Promise resolver ${type} is not a function`);
        }
    }

    function getNextTick() {
        const root = getGlobalObject();
        if (root.process && typeof root.process.nextTick === 'function') {
            return root.process.nextTick;
        } else if (typeof root.setImmediate === 'function') {
            return root.setImmediate;
        } else if (typeof root.setTimeout === 'function') {
            return function(fn, ...args) {
                setTimeout(fn, 0, ...args);
            };
        } else {
            return function(fn, ...args) {
                fn(...args);
            };
        }
    }

    function getGlobalObject() {
        if (typeof self !== "undefined") { return self; }
        if (typeof window !== "undefined") { return window; }
        if (typeof global !== "undefined") { return global; }
        throw new Error("No global object!");
    }

    /**
     * Если переданное значение похоже на thenable объект,
     * то вернуть метод then
     */
    function getIfThenable(thenable) {
        const type = typeof thenable;
        if (thenable && ((type === 'function') || (type === 'object'))) {
            const thenFunction = thenable.then;
            if (thenFunction && (typeof thenFunction === 'function')) {
                return thenFunction.bind(thenable);
            }
        }
    }

    /**
     * Запретить вызов функций более одного раза
     */
    const once = function(...funcs) {
        let called;
        return funcs.map(fn => {
            return function(...args) {
                if (called) return;
                called = true;
                return fn(...args);
            }
        });
    };

    function defaultOnFulfilled(value) {
        return value;
    }

    function defaultOnRejected(error) {
        throw error;
    }

    return Promise;

}));
