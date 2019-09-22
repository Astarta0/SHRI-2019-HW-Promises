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