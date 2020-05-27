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
    .get('/vacancies', Handlers.vacancies_get)
    .post('/vacancies', Handlers.vacancies_post)
    .get('/vacancies/:uuid', Handlers.vacancies_uuid_get)
    .delete('/vacancies/:uuid', Handlers.vacancies_uuid_delete)
    .delete('/vacancies/:uuid/close', Handlers.vacancies_uuid_close_delete)
    .get('/vacancies/:uuid/test', Handlers.vacancies_uuid_test_get)
    .post('/vacancies/:uuid/test', Handlers.vacancies_uuid_test_post)
    .delete('/vacancies/:uuid/test', Handlers.vacancies_uuid_test_delete)
    // .get('/vacancies/:uuid/candidats', Handlers.vacancies_uuid_candidats_get)
    // .post('/vacancies/:uuid/candidats', Handlers.vacancies_uuid_candidats_post)
    .get('/vacancies/:uuid/candidats/:candidatsID', Handlers.vacancies_uuid_candidats_uuid_get)
    .post('/vacancies/:uuid/candidats/:candidatsID', Handlers.vacancies_uuid_candidats_uuid_post)
    .delete('/vacancies/:uuid/candidats/:candidatsID', Handlers.vacancies_uuid_candidats_uuid_delete)
    // .get('/vacancies/:uuid/candidats/:candidatsID/invitation', Handlers.vacancies_uuid_candidats_uuid_invitation_get)
    .post('/vacancies/:uuid/candidats/:candidatsID/invitation', Handlers.vacancies_uuid_candidats_uuid_invitation_post)
    .delete('/vacancies/:uuid/candidats/:candidatsID/invitation', Handlers.vacancies_uuid_candidats_uuid_invitation_delete)
    .get('/vacancies/:uuid/candidats/:candidatsID/execution', Handlers.vacancies_uuid_candidats_uuid_execution_get)
    // .post('/vacancies/:uuid/candidats/:candidatsID/execution', Handlers.vacancies_uuid_candidats_uuid_execution_post)
    // .delete('/vacancies/:uuid/candidats/:candidatsID/execution', Handlers.vacancies_uuid_candidats_uuid_execution_delete)

module.exports = {
    routes : () => { return router.routes(); },
    allowedMethods : () => { return router.allowedMethods(); }
}