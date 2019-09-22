const Promise = require('../src/promise');

test('Promise.all ok', (done) => {
    expect.assertions(1);

    const p1 = new Promise((resolve) => setTimeout(resolve, 100, 'first'));
    const p2 = new Promise((resolve) => setTimeout(resolve, 200, 'second'));
    const p3 = new Promise((resolve) => setTimeout(resolve, 300, 'third'));

    Promise.all([p1, p2, p3])
        .then(result => {
            expect(result).toEqual(['first', 'second', 'third']);
            done();
        });
});

test('Promise.all fail', (done) => {
    expect.assertions(1);

    const p1 = new Promise((resolve) => setTimeout(resolve, 100, 'first'));
    const p2 = new Promise((_, reject) => setTimeout(reject, 200, 'error'));
    const p3 = new Promise((resolve) => setTimeout(resolve, 300, 'third'));

    Promise.all([p1, p2, p3])
        .then(() => {
            expect(true).toBeFalsy();
            done();
        })
        .catch(err => {
            expect(err).toEqual('error');
            done();
        });
});

test('Promise.race ok', (done) => {
    expect.assertions(1);

    const p1 = new Promise(function(resolve) {
        setTimeout(resolve, 500, "один");
    });
    const p2 = new Promise(function(resolve) {
        setTimeout(resolve, 100, "два");
    });

    Promise.race([p1, p2]).then(function(value) {
        expect(value).toEqual("два");
        done();
    });
});

test('Promise.race fail', (done) => {
    expect.assertions(1);

    const p1 = new Promise(function(resolve) {
        setTimeout(resolve, 500, "один");
    });
    const p2 = new Promise(function(_, reject) {
        setTimeout(reject, 100, "два");
    });

    Promise.race([p1, p2]).then(function() {
        expect(true).toBeFalsy();
        done();
    }).catch(err => {
        expect(err).toEqual("два");
        done();
    });
});

test('Promise.resolve', done => {
    expect.assertions(1);
    Promise.resolve('resolve').then(value => {
        expect(value).toEqual("resolve");
        done();
    });
});

test('Promise.reject', done => {
    expect.assertions(1);
    Promise.reject('reject').catch(value => {
        expect(value).toEqual("reject");
        done();
    });
});