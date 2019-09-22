const Promise = require('../index');
const utils = require('../utils');

test('ошибка в executore', done => {
    const message = 'ошибка в executore';

    const p = new Promise(function() {
        throw new Error(message);
    });

    expect.assertions(1);

    p.catch(err => {
        expect(err.message).toEqual(message);
        done();
    });
});

test('resolve сразу', () => {
    const p = new Promise(resolve => resolve('resolved'));
    expect.assertions(1);
    return expect(p).resolves.toEqual('resolved');
});

test('reject сразу', () => {
    const p = new Promise(function (_, reject) { reject('rejected') });
    expect.assertions(1);
    return expect(p).rejects.toEqual('rejected')
});

test('resolve через 1 секунду', () => {
    const p = utils.delay(1000, 'resolved');
    expect.assertions(1);
    return expect(p).resolves.toEqual('resolved');
});

test('reject через 1 секунду', () => {
    const p = utils.delayReject(1000, 'my error');
    expect.assertions(1);
    return expect(p).rejects.toEqual('my error')
});

test('chain', done => {
    expect.assertions(1);
    const promise = new Promise(()=>{});
    promise.then(function () {}, undefined).then(undefined, function () {
        expect(true).toBeTruthy();
        done();
    });
    promise.reject();
});
