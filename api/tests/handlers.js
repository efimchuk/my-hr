const fs = require('fs');
const Tests = require('../../lib/tests');

async function tests_get(ctx, next){
    let authorName = ctx.cookies.get('user');

    if(authorName == undefined){
        ctx.redirect('/auth');
        return;
    }

    if(ctx.query.json == undefined){
        ctx.body = String(fs.readFileSync(__dirname + '/static/tests.html'));
    } else {
        let tests = await Tests.getTestsByAuthorName(authorName);

        tests = tests == undefined ? [] : tests;

        ctx.body = JSON.stringify(tests);
    }
}
async function tests_uuid_get(ctx, next){
    ctx.body = `GET /tests/:uuid uuid=${ctx.params.uuid}`;
}
async function tests_uuid_patch(ctx, next){
    ctx.body = `PATCH /tests/:uuid uuid=${ctx.params.uuid}`;
}
async function tests_uuid_post(ctx, next){
    ctx.body = `POST /tests/:uuid uuid=${ctx.params.uuid}`;
}
async function tests_uuid_delete(ctx, next){
    ctx.body = `DELETE /tests/:uuid uuid=${ctx.params.uuid}`;
}
async function tests_uuid_executions_get(ctx, next){
    ctx.body = `GET /tests/:uuid/executions uuid=${ctx.params.uuid}`;
}
async function tests_uuid_executions_uuid_get(ctx, next){
    ctx.body = `GET /tests/:testUUID/executions/:executionUUID testUUID=${ctx.params.testUUID} executionUUID=${ctx.params.executionUUID}`;
}
async function tests_uuid_invitations_get(ctx, next){
    ctx.body = `GET /tests/:uuid/invitations/ uuid=${ctx.params.uuid}`;
}
async function tests_uuid_invitations_post(ctx, next){
    ctx.body = `POST /tests/:uuid/invitations/ uuid=${ctx.params.uuid}`;
}
async function tests_uuid_invitations_delete(ctx, next){
    ctx.body = `DELETE /tests/:uuid/invitations/:invUUID uuid=${ctx.params.uuid} invUUID=${ctx.params.invUUID}`;
}
async function invitations_uuid_get(ctx, next){
    ctx.body = `GET /invitations/:uuid uuid=${ctx.params.uuid}`;
}
async function invitations_uuid_post(ctx, next){
    ctx.body = `POST /invitations/:uuid uuid=${ctx.params.uuid}`;
}

module.exports = {
    tests_get : tests_get,
    tests_uuid_get : tests_uuid_get,
    tests_uuid_patch : tests_uuid_patch,
    tests_uuid_post : tests_uuid_post,
    tests_uuid_delete : tests_uuid_delete,
    tests_uuid_executions_get : tests_uuid_executions_get,
    tests_uuid_executions_uuid_get : tests_uuid_executions_uuid_get,
    tests_uuid_invitations_get : tests_uuid_invitations_get,
    tests_uuid_invitations_post : tests_uuid_invitations_post,
    tests_uuid_invitations_delete : tests_uuid_invitations_delete,
    invitations_uuid_get : invitations_uuid_get,
    invitations_uuid_post : invitations_uuid_post
}