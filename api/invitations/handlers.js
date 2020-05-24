const Users = require('../../lib/users');
const Tests = require('../../lib/tests');
const Answers = require('../../lib/answers');
const Invitations = require('../../lib/invitations');
const fs = require('fs');

async function getCurrentExercise(invitations_uuid){
    let values = [invitations_uuid];
    let query = `SELECT uuid
                FROM tests
                WHERE id IN (
                    SELECT test_id
                    FROM invitations
                    WHERE uuid = $1
                )`;

    let testUUID = (await Query(query, values)).rows[0].uuid;

    let currentTest = await Tests.getTestByUUID(testUUID);

    let answered = await Answers.getAnsweredExerciseIDs(invitations_uuid);

    let exercises = currentTest.exercises.filter(function(element){
        let finded = answered.find(function (element){
            return element == this;
        }, element.id);

        return finded == undefined;
    });

    return exercises[0];
}

async function invitations_uuid_get(ctx, next){
    let authorName = ctx.cookies.get('user');
    
    if(authorName == undefined){
        ctx.body = String(fs.readFileSync(__dirname + '/static/auth.html'));
        return;
    }

    let currentUser = await Users.getUserByName(authorName);

    if(currentUser == undefined || currentUser.role != 2){
        ctx.body = String(fs.readFileSync(__dirname + '/static/auth.html'));
    } else {
        let exercise = await getCurrentExercise(ctx.params.uuid);

        if(exercise != undefined){
            if(ctx.query.json == undefined){
                ctx.body = String(fs.readFileSync(__dirname + '/static/execution.html'));
            } else {
                if(!(await Answers.existsExecutedExercise(ctx.params.uuid, exercise.id))){
                    await Answers.createExecutedExercise(ctx.params.uuid, exercise.id);
                }
                
                ctx.status = 200;
                ctx.body = exercise;
            }
        } else {
            await Invitations.setExecutedByUUID(ctx.params.uuid);
            await Users.deleteUser(ctx.params.uuid);
            ctx.body = String(fs.readFileSync(__dirname + '/static/end.html'));
        }
    }
}
async function invitations_uuid_post(ctx, next){
    let authorName = ctx.cookies.get('user');

    let currentUser = await Users.getUserByName(authorName);

    if(currentUser == undefined || currentUser.role != 2){
        let executor = await Users.getUserByName(ctx.params.uuid);

        if(executor == undefined){
            ctx.status = 400;
            ctx.body = "Приглашение не актуально!";
            return;
        } else {
            let pin = ctx.request.body.pin;

            if(executor.password != pin){
                ctx.status = 400;
                ctx.body = "Неверный пин. Попробуйте еще!";
                return;
            } else {
                ctx.cookies.set('user', executor.name);
                ctx.status = 200;
                return;
            }
        }
    }

    if(currentUser.name == ctx.params.uuid){
        let exercise = ctx.request.body; 

        await Answers.saveAnswer(exercise, ctx.params.uuid);

        let _exercise = await getCurrentExercise(ctx.params.uuid);
        
        if(_exercise != undefined){
            if(!(await Answers.existsExecutedExercise(ctx.params.uuid, _exercise.id))){
                await Answers.createExecutedExercise(ctx.params.uuid, _exercise.id);
            }

            ctx.status = 200;
            ctx.body = _exercise;
        } else {
            ctx.status = 202;
            await Invitations.setExecutedByUUID(ctx.params.uuid);
        }
    }
}

module.exports = {
    invitations_uuid_get : invitations_uuid_get,
    invitations_uuid_post : invitations_uuid_post
}