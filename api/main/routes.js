const Router = require('koa-router');
const KoaBody = require('koa-body');
const Handlers = require('./handlers');

const router = Router();

router
    .get('/', Handlers.main_path)
    .get('/auth', Handlers.auth_path)

module.exports = {
    routes : () => { return router.routes(); },
    allowedMethods : () => { return router.allowedMethods(); }
}