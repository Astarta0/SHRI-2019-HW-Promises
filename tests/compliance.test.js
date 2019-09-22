const promisesAplusTests = require("promises-aplus-tests");
const Promise = require("../src/promise");

function resolved (value) {
    return new Promise(function(resolve) {
        resolve(value);
    });
}

function rejected (reason) {
    return new Promise(function(resolve, reject) {
        reject(reason);
    });
}

const adapter = {
    resolved: resolved,
    rejected: rejected,
    deferred: Promise.deferred
};

test('test for compliance', done => {
    console.log('---------------------------------------------------');
    promisesAplusTests(adapter, function (err) {
        done(err);
    });
}, 180000);
