const promisesAplusTests = require("promises-aplus-tests");
const Promise = require("../index");

const adapter = {
    deferred() {
        const promise = new Promise(()=>{});
        return {
            promise,
            resolve: value => promise.resolve(value),
            reject: reason => promise.reject(reason)
        }
    },
    resolved(value) {
        const promise = new Promise(()=>{});
        promise.value = value;
        promise.state = 'fulfilled';
        return promise;
    },
    rejected(reason) {
        const promise = new Promise(()=>{});
        promise.value = reason;
        promise.state = 'rejected';
        return promise;
    }
};

test.skip('test for compliance', done => {
    promisesAplusTests(adapter, function (err) {
        done(err);
    });
}, 180000);
