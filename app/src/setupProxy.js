const proxy = require('http-proxy-middleware')

module.exports = function(app) {
    app.use(proxy('/python/**', { target : 'http://localhost:8000', secure: false }));
    app.use(proxy('/api/**', { target : 'https://localhost:8080', secure: false, changeOrigin: true }));
}