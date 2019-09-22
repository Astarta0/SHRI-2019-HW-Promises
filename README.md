<a href="http://promisesaplus.com/">
    <img src="http://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo"
         title="Promises/A+ 1.1 compliant" align="right" />
</a>

# SHRI-2019-HW-Promises

Полифил для ES6 Promise

```
# Установить зависимости
npm install

# Запустить тесты
npm test
```

### Структура

```
│
├── index.html            Файл для проверки с примером из задания
├── src/
│   └── promise.js        Полифил в umd модуле
└── tests/                Тесты
```


### Что сделано
- [x] Promise.prototype.then()
- [x] Promise.prototype.catch()
- [x] Promise.prototype.done()
- [x] Promise.resolve()
- [x] Promise.reject()
- [x] Promise.all()
- [x] Promise.race()
- [x] Обработка thenable объектов
- [x] Соответствие Promise/A+
