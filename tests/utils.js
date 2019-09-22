module.exports = {

    delay(ms, value) {
        return new Promise(resolve => {
            setTimeout(resolve, ms, value);
        });
    },

    delayReject(ms, value) {
        return new Promise((_, reject) => {
            setTimeout(reject, ms, value);
        });
    }

};
