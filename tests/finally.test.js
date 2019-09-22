const Promise = require('../src/promise');

test('finally', (done) => {
    expect.assertions(2);

    Promise.resolve(1).finally(() => {
        expect(true).toBeTruthy();
        done();
    }).then(value => {
        expect(value).toEqual(1);
        done();
    });
});
