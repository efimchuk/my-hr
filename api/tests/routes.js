const Router = require('koa-router');
const KoaBody = require('koa-body');
const Handlers = require('./handlers');
const Users = require('../../lib/users');

const router = Router();

router
    .use(KoaBody({ multipart: true }))
    .use(async function (ctx, next){
        let authorName = ctx.cookies.get('user');
    
        if(authorName == undefined){
            ctx.redirect('/auth');
            return;
        } else {
            ctx.currentUser = await Users.getUserByName(authorName);
            await next();
        }
    })
    .get('/tests', Handlers.tests_get)
    .post('/tests', Handlers.tests_post)
    .get('/tests/:uuid', Handlers.tests_uuid_get)
    .delete('/tests/:uuid', Handlers.tests_uuid_delete)
    .get('/tests/:uuid/executions', Handlers.tests_uuid_executions_get)
    .get('/tests/:testUUID/executions/:executionUUID', Handlers.tests_uuid_executions_uuid_get)
    .get('/tests/:uuid/invitations', Handlers.tests_uuid_invitations_get)
    .post('/tests/:uuid/invitations', Handlers.tests_uuid_invitations_post)
    .delete('/tests/:uuid/invitations/:invUUID', Handlers.tests_uuid_invitations_delete)

module.exports = {
    routes : () => { return router.routes(); },
    allowedMethods : () => { return router.allowedMethods(); }
}