const Router = require('koa-router');
const KoaBody = require('koa-body');
const Handlers = require('./handlers');
const Users = require('../../lib/users');

const router = Router();

router
    .use(KoaBody({ multipart: true }))
    .get('/invitations/:uuid', Handlers.invitations_uuid_get)
    .post('/invitations/:uuid', Handlers.invitations_uuid_post)

module.exports = {
    routes : () => { return router.routes(); },
    allowedMethods : () => { return router.allowedMethods(); }
}