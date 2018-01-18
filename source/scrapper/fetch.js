const isBrowser =() => typeof(window) !== 'undefined';
exports.fetch = isBrowser()? window.fetch: require('fetch-cookie/node-fetch')(require('node-fetch'));