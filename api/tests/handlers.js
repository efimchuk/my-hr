const fs = require('fs');
const Tests = require('../../lib/tests');
const Invitations = require('../../lib/invitations');

async function tests_get(ctx, next){
    if(ctx.query.json == undefined){
        ctx.body = String(fs.readFileSync(__dirname + '/static/tests.html'));
    } else {
        let tests = await Tests.getTestsByAuthorName(ctx.currentUser.name);

        tests = tests == undefined ? [] : tests;

        ctx.status = 200;
        ctx.body = JSON.stringify(tests);
    }
}
async function tests_uuid_get(ctx, next){
    if(ctx.query.json == undefined){
        ctx.body = String(fs.readFileSync(__dirname + '/static/test.html'));
        return;
    } else {
        let currentTest = {};

        if(ctx.params.uuid == 'new'){
            currentTest = undefined;
        } else {
            let tests = await Tests.getTestsByAuthorName(ctx.currentUser.name);

            currentTest = tests.find(async function (element, index, array){
                if(element.uuid == this){
                    return true;
                }

                return false;
            }, ctx.params.uuid);
        }

        if(currentTest == undefined){
            if(ctx.params.uuid == 'new'){
                currentTest = {};
                currentTest.id = 'new';
                currentTest.viewMode = 0;
                ctx.status = 204;
                ctx.body = JSON.stringify(currentTest);
                return;
            } else {
                ctx.status = 404;
                ctx.body = 'Страница не найдена';
                return;
            }
        } else {
            currentTest = await Tests.getTestByUUID(ctx.params.uuid);
            currentTest.viewMode = 1;
            ctx.status = 200;
            ctx.body = JSON.stringify(currentTest);
            return;
        }
    }
}
async function tests_post(ctx, next){
    let test = ctx.request.body;
    if(test.id == undefined || test.id == 'new'){
        test = await Tests.addTest(ctx.request.body, ctx.currentUser.name);
    } else {
        Test = await Tests.editTest(ctx.request.body);
    }

    test.viewMode = 1;
    ctx.body = test;
}
async function tests_uuid_delete(ctx, next){
    let tests = await Tests.getTestsByAuthorName(ctx.currentUser.name);

    let currentTest = tests.find(function(test){return test.uuid == this}, ctx.params.uuid);

    if(currentTest != undefined){
        let deletedUUID = await Tests.deleteByUUID(ctx.params.uuid);

        if(deletedUUID == undefined){
            ctx.status = 502;
        } else {
            ctx.status = 200;
            ctx.body = deletedUUID;
        }
    } else {
        ctx.status = 404;
        ctx.body = 'Тест не найден';
        ctx.redirect('back');
    }
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
    let testId = ctx.params.uuid;

    let currentTest = await Tests.getTestByUUID(testId);

    let invitation = await Invitations.createInvitationByTestID(currentTest.id);

    if(invitation == undefined){
        ctx.status = 502;
    } else {
        ctx.status = 201;
        ctx.body = invitation;
    }
}
async function tests_uuid_invitations_delete(ctx, next){
    let uuid = ctx.params.invUUID;

    let deleted = await Invitations.deleteInvitationByUUID(uuid);

    if(deleted == undefined){
        ctx.status = 502;
    } else {
        ctx.status = 200;
        ctx.body = {uuid : deleted.uuid};
    }
}

module.exports = {
    tests_get : tests_get,
    tests_post : tests_post,
    tests_uuid_get : tests_uuid_get,
    tests_uuid_delete : tests_uuid_delete,
    tests_uuid_executions_get : tests_uuid_executions_get,
    tests_uuid_executions_uuid_get : tests_uuid_executions_uuid_get,
    tests_uuid_invitations_get : tests_uuid_invitations_get,
    tests_uuid_invitations_post : tests_uuid_invitations_post,
    tests_uuid_invitations_delete : tests_uuid_invitations_delete
}