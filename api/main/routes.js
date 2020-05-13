const Router = require('koa-router');
const KoaBody = require('koa-body');
const Handlers = require('./handlers');

const router = Router();

router
    .use(KoaBody({ multipart: true }))
    .get('/', Handlers.main_get)
    .get('/auth', Handlers.auth_get)
    .post('/auth', Handlers.auth_post)
    .delete('/auth', Handlers.auth_delete)

module.exports = {
    routes : () => { return router.routes(); },
    allowedMethods : () => { return router.allowedMethods(); }
}