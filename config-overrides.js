// eslint-disable-next-line @typescript-eslint/no-var-requires
const million = require('million/compiler');

// eslint-disable-next-line no-undef
module.exports = function override(config) {
    config.plugins.push(million.webpack());
    return config;
};
