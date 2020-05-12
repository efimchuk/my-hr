const http = require('http');
const PORT = process.env.PORT || 4000; // To support launching in Heroku environment
const fs = require('fs');

const Koa = require('koa');
const app = new Koa();

const api = require('./api/main/routes');
const tests = require('./api/tests/routes');

app.use(async function (ctx, next){
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

app.use(api.routes());
app.use(api.allowedMethods());

app.use(tests.routes());
app.use(tests.allowedMethods());

try {
    app.listen(PORT);
} catch(e) {
    console.log('Something is wrong.');
    process.exit();
}

console.log(`Server is listening on ${PORT}`);