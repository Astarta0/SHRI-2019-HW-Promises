const promisesAplusTests = require("promises-aplus-tests");
const Promise = require("../src/promise");

const adapter = {
    resolved: Promise.resolve,
    rejected: Promise.reject,
    deferred: Promise.deferred
};

test('test for compliance', done => {
    console.log('---------------------------------------------------');
    promisesAplusTests(adapter, function (err) {
        done(err);
    });
}, 180000);
