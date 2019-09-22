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

    /*  конструктор */
    function Promise(executor) {
        if(typeof executor !== "function") {
            handleTypeOfExecutorError(executor);
        }

        this.onFulfilledQueue = [];
        this.onRejectedQueue = [];
        this.state = STATES.PENDING;
        this.value = null;

        try {
            executor(this.resolve.bind(this), this.reject.bind(this));
        } catch (error) {
            this.reject(error);
        }
    }

    Promise.prototype.reject = function(reason){
        setImmediate(() => {
            // console.log('reject');
            this.value = reason;
            this.state = STATES.REJECTED;

            this.runHandlerQueue();

            while(this.onFulfilledQueue.length > 0) {
                const { promise } = this.onFulfilledQueue.shift();
                promise.reject(reason);
            }
        });
    };

    Promise.prototype.resolve = function(value){
        setImmediate(() => {
            this.value = value;
            this.state = STATES.FULFILLED;

            this.runHandlerQueue();
        });
    };

    Promise.prototype.runHandlerQueue = function(){
        if (this.state === STATES.PENDING) {
            throw new Error('Illegal runHandlerQueue invocation');
        }
        const queue = this.state === STATES.FULFILLED
            ? this.onFulfilledQueue
            : this.onRejectedQueue;

        while(queue.length > 0) {
            const { promise, handler } = queue.shift();
            let result;

            try {
                result = handler(this.value);
            } catch(err) {
                promise.reject(err);
            }

            if(result && result instanceof Promise) {
                result
                    .then(function(value) {
                        promise.resolve(value);
                    })
                    .catch(function(err){
                        promise.reject(err);
                    });
            } else {
                promise.resolve(result);
            }
        }
    };

    Promise.prototype.__then = function(onFulfilled, onRejected) {
        const promise = new Promise((resolve, reject) => {
            if (this.state === STATES.FULFILLED) {

            }
            else if (this.state === STATES.REJECTED) {
                const result = onRejected(this.value);
                if (result && result instanceof Promise) {
                    result.then(resolve, reject);
                } else {
                    resolve(result);
                }
            } else {
                if (typeof onFulfilled === 'function') {
                    this.onFulfilledQueue.push({
                        handler: onFulfilled,
                        promise
                    });
                }
                if (typeof onRejected === 'function') {
                    this.onRejectedQueue.push({
                        handler: onRejected,
                        promise
                    });
                }
            }
        });
        return promise;
    };

    Promise.prototype.then = function(onFulfilled, onRejected){
        if (typeof onFulfilled !== 'function' && this.state === STATES.FULFILLED ||
            typeof onRejected !== 'function' && this.state === STATES.REJECTED) {
            return this;
        }

        const promise = new this.constructor(function() {});

        // console.debug('then', this.state);

        if (typeof onFulfilled === "function") {
            if (this.state === STATES.FULFILLED) {
                setImmediate(() => {
                    let onFulfilledResult;
                    try {
                        onFulfilledResult = onFulfilled(this.value);
                    } catch (err) {
                        // run rejection queue
                        this.runHandlerQueue();
                    }

                    if (onFulfilledResult && onFulfilledResult instanceof Promise) {
                        onFulfilledResult
                            .then(function(value) {
                                promise.resolve(value);
                            })
                            .catch(function(err){
                                promise.reject(err);
                            });
                    } else {
                        promise.resolve(onFulfilledResult);
                    }
                });
            } else if (this.state !== STATES.REJECTED) {
                this.onFulfilledQueue.push({
                    handler: onFulfilled,
                    promise
                });
            }
        }

        // console.log(typeof onRejected, this.state);

        if(typeof onRejected === "function") {
            if (this.state === STATES.REJECTED) {
                setImmediate(() => {
                    // console.log('rej');
                    let onRejectedResult;
                    try {
                        onRejectedResult = onRejected(this.value);
                    } catch (err) {
                        // run rejection queue
                        this.runHandlerQueue();
                    }

                    if (onRejectedResult && onRejectedResult instanceof Promise) {
                        onRejectedResult
                            .then(function(value) {
                                promise.resolve(value);
                            })
                            .catch(function(err){
                                promise.reject(err);
                            });
                    } else {
                        promise.resolve(onRejectedResult);
                    }
                });
            } else if (this.state !== STATES.FULFILLED) {
                this.onRejectedQueue.push({
                    handler: onRejected,
                    promise
                });
            }
        }
        return promise;
    };

    Promise.prototype.catch = function(onRejected) {
        return this.then(null, onRejected);
    };



    // checkNativePromisesExist();

    // TODO для тестов
    // forceReplaceNativePromise();

    //
    // UTILITES
    //

    /**
     *  Обработка неверного типа параметра executor конструктора промисов
     * @param executor
     */
    function handleTypeOfExecutorError(executor) {
        switch(typeof executor) {
            case "undefined":
            case "number":
            case "string":
            case "boolean":
                throw new TypeError(`Promise resolver ${executor} is not a function`);
                break;
            case "object":
            case "symbol":
                let type;
                if(executor === null) {
                    type = null;
                } else if(Array.isArray(executor)) {
                    type = "Array"
                } else {
                    type = Object.prototype.toString.call(executor);
                }
                throw new TypeError(`Promise resolver ${type} is not a function`);
                break;
        }
    }

    function getGlobalObject() {
        if (typeof self !== "undefined") { return self; }
        if (typeof window !== "undefined") { return window; }
        if (typeof global !== "undefined") { return global; }
        throw new Error("No global object!");
    }

    function checkNativePromisesExist() {
        const globalObject = getGlobalObject();
        if(!globalObject.Promise) {
            globalObject.Promise = Promise;
        }
    }

    function forceReplaceNativePromise() {
        const globalObject = getGlobalObject();
        globalObject.Promise = Promise;
    }

    return Promise;

}));
