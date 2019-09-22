const Promise = require('../src/promise');

Promise.strict = true;

test('Передача null в конструктор промиса', () => {
    expect(() => {
        new Promise(null);
    }).toThrow(
        new TypeError(`Promise resolver null is not a function`)
    );
});

test('Передача undefined в конструктор промиса', () => {
    expect(() => {
        new Promise(undefined);
    }).toThrow(
        new TypeError(`Promise resolver undefined is not a function`)
    );
});

test('Передача числа в конструктор промиса', () => {
    expect(() => {
        new Promise(1);
    }).toThrow(
        new TypeError(`Promise resolver 1 is not a function`)
    );
});

test('Передача строки в конструктор промиса', () => {
    expect(() => {
        new Promise("help");
    }).toThrow(
        new TypeError(`Promise resolver help is not a function`)
    );
});

test('Передача bool в конструктор промиса', () => {
    expect(() => {
        new Promise(true);
    }).toThrow(
        new TypeError(`Promise resolver true is not a function`)
    );
});

test('Передача объекта в конструктор промиса', () => {
    expect(() => {
        new Promise({});
    }).toThrow(
        new TypeError(`Promise resolver [object Object] is not a function`)
    );
});

test('Передача массива в конструктор промиса', () => {
    expect(() => {
        new Promise([]);
    }).toThrow(
        new TypeError(`Promise resolver Array is not a function`)
    );
});

test('Передача symbol в конструктор промиса', () => {
    expect(() => {
        new Promise(Symbol("b"));
    }).toThrow(
        new TypeError('Promise resolver [object Symbol] is not a function')
    );
});


