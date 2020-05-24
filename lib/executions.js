const Tests = require('../lib/tests');
const Answers = require('../lib/answers');

async function getExecutionsByTestUUID(uuid){
    let values = [uuid];
    let query = `SELECT *
                FROM invitations
                WHERE status = 2 AND test_id IN (
                    SELECT id
                    FROM tests
                    WHERE uuid = $1
                )`;

    let executions = (await Query(query, values)).rows;

    if(executions.length){
        return executions;
    } else {
        return [];
    }
}

async function getExecutionByUUID(uuid){
    let values = [uuid];
    let query = `SELECT *
                FROM invitations
                WHERE status = 2 AND uuid = $1`;

    let executions = (await Query(query, values)).rows;

    if(executions.length){
        let execution = executions[0];

        let answers = await Answers.getAnswersByInvitationUUID(execution.uuid);

        execution.answers = [];

        for(let i = 0; i < answers.length; i++){
            let currentAnswer = answers[i];

            let currentExercise = execution.answers.find(function(element){
                return element.id == this;
            }, currentAnswer.exercise_id);

            let newAnswer = {
                id : currentAnswer.exercise_id,
                executing_time : currentAnswer.executing_time
            };

            if(currentAnswer.pass){
                newAnswer.pass = currentAnswer.pass;
            } else {
                newAnswer.pass = false;
                if(currentAnswer.variants.length == 1 && currentAnswer.variants[0].text != null){
                    newAnswer.answer = currentAnswer.variants[0].text;
                } else {
                    newAnswer.selected = currentAnswer.variants.map(element => element.variant_id)
                }
            }

            execution.answers.push(newAnswer);
        }

        return execution;
    } else {
        return undefined;
    }
}

async function getExecutionByID(id){
    let values = [id];
    let query = `SELECT uuid
                FROM invitations
                WHERE status = 2 AND id = $1`;

    let executionUUID = (await Query(query, values)).rows[0].uuid;

    return await getExecutionByUUID(executionUUID);
}

module.exports = {
    getExecutionsByTestUUID : getExecutionsByTestUUID,
    getExecutionByUUID : getExecutionByUUID,
    getExecutionByID : getExecutionByID
}