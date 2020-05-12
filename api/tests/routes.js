const Router = require('koa-router');
const KoaBody = require('koa-body');
const Handlers = require('./handlers');

const router = Router();

router
    .use(KoaBody({ multipart: true }))
    .get('/tests', Handlers.tests_get)
    .get('/tests/:test:uuid', Handlers.tests_uuid_get)
    .post('/tests/:test:uuid', Handlers.tests_uuid_post)
    .patch('/tests/:test:uuid', Handlers.tests_uuid_patch)
    .delete('/tests/:test:uuid', Handlers.tests_uuid_delete)
    .get('/tests/:uuid/executions', Handlers.tests_uuid_executions_get)
    .get('/tests/:testUUID/executions/:executionUUID', Handlers.tests_uuid_executions_uuid_get)
    .get('/tests/:uuid/invitations', Handlers.tests_uuid_invitations_get)
    .post('/tests/:uuid/invitations', Handlers.tests_uuid_invitations_post)
    .delete('/tests/:uuid/invitations/:invUUID', Handlers.tests_uuid_invitations_delete)
    .get('/invitations/:uuid', Handlers.invitations_uuid_get)
    .post('/invitations/:uuid', Handlers.invitations_uuid_post)

module.exports = {
    routes : () => { return router.routes(); },
    allowedMethods : () => { return router.allowedMethods(); }
}