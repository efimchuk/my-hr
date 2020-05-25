async function saveAnswer(executedExercise, invitationUUID){
    let values = [];
    let query = '';

    if(executedExercise.pass){
        values = [invitationUUID, executedExercise.id];
        query = `UPDATE executed_exercises
                SET pass = TRUE, executed_time = NOW()
                WHERE exercise_id = $2 AND invitation_id IN (SELECT id FROM invitations WHERE uuid = $1)`;

        await Query(query, values);
        return;
    }

    // if(executedExercise.pass){
    //     values = [invitationUUID, executedExercise.id];
    //     query = `INSERT INTO answers (invitation_id, exercise_id, pass)
    //                 VALUES ((SELECT id FROM invitations WHERE uuid = $1), $2, TRUE)`;

    //     await Query(query, values);
    //     return;
    // }

    switch(executedExercise.type){
        case 0: 
        case 3: 

            values = [invitationUUID, executedExercise.id, executedExercise.answer];
            // query = `INSERT INTO answers (invitation_id, exercise_id, pass, text)
            //             VALUES ((SELECT id FROM invitations WHERE uuid = $1), $2, FALSE, $3)`;
            query = `WITH RECURSIVE invitation_ids AS (
                        SELECT id
                        FROM invitations
                        WHERE uuid = $1), updated_executed_exercises AS (
                        UPDATE executed_exercises 
                        SET executed_time = NOW() 
                        WHERE exercise_id = $2 AND invitation_id IN (SELECT id FROM invitation_ids)
                        RETURNING id)
                    INSERT INTO answers (executed_exercise_id, text)
                    VALUES ((SELECT id FROM updated_executed_exercises), $3)`;

            await Query(query, values);
            break;
        case 1: 
        case 2: 

            values = [invitationUUID, executedExercise.id];
            // query = `INSERT INTO answers (invitation_id, exercise_id, pass, variant_id)
            //             VALUES <<values>>`;
            query = `WITH RECURSIVE invitation_ids AS (
                        SELECT id
                        FROM invitations
                        WHERE uuid = $1), updated_executed_exercises AS (
                        UPDATE executed_exercises 
                        SET executed_time = NOW() 
                        WHERE exercise_id = $2 AND invitation_id IN (SELECT id FROM invitation_ids)
                        RETURNING id)
                    INSERT INTO answers (executed_exercise_id, variant_id)
                        VALUES <<values>>`;
                        
            let _values = executedExercise.selected.map(element => `((SELECT id FROM updated_executed_exercises), ${element})`).join(',');
             
            query = query.replace('<<values>>', _values);
            await Query(query, values);
            break;
        break;
    }
}

async function getAnsweredExerciseIDs(uuid){
    let values = [uuid];
    let query = `SELECT exercise_id
            FROM executed_exercises
            WHERE invitation_id IN (
                SELECT id
                FROM invitations
                WHERE uuid = $1
            ) AND executed_time IS NOT NULL`;

    let result = (await Query(query, values)).rows.map(element => element.exercise_id);

    return result;
}

async function createExecutedExercise(invitationUUID, exerciseID){
    let values = [invitationUUID, exerciseID];
    let query = `INSERT INTO executed_exercises (invitation_id, pass, display_time, exercise_id)
                VALUES ((
                    SELECT id
                    FROM invitations
                    WHERE uuid = $1
                ), FALSE, NOW(), $2)
                RETURNING *`;

    let executedExercises = (await Query(query, values)).rows;
    
    if(executedExercises.length){
        return executedExercises[0];
    } else {
        return undefined;
    }
} 

async function existsExecutedExercise(invitationUUID, exerciseID){
    let values = [invitationUUID, exerciseID];
    let query = `SELECT * 
                FROM executed_exercises 
                WHERE invitation_id = (
                    SELECT id
                    FROM invitations
                    WHERE uuid = $1) AND exercise_id = $2`;

    let executedExercises = (await Query(query, values)).rows;

    return executedExercises.length != 0;
}

async function getAnswersByInvitationUUID(uuid){
    let values = [uuid];
    let query = `SELECT *, EXTRACT(EPOCH FROM executed_time - display_time) AS executing_time 
                FROM executed_exercises
                WHERE invitation_id IN (
                    SELECT id
                    FROM invitations
                    WHERE uuid = $1)`;

    let executedExercises = (await Query(query, values)).rows;

    if(executedExercises.length){
        let executedIDs = executedExercises.map(element => element.id);

        query = `SELECT * 
                FROM answers 
                WHERE executed_exercise_id IN (${executedIDs.join(',')})`;

        let answers = (await Query(query)).rows;

        if(answers.length){
            for(let answerIndex = 0; answerIndex < answers.length; answerIndex++){
                let currentAnswer = answers[answerIndex];

                let currentExecutedExercise = executedExercises.find(function(element){return this == element.id}, currentAnswer.executed_exercise_id);

                if(currentExecutedExercise.variants == undefined){
                    currentExecutedExercise.variants = [];
                }

                currentExecutedExercise.variants.push(currentAnswer);
            }
        }
        return executedExercises;
    } else {
        return [];
    }
}

module.exports = {
    saveAnswer : saveAnswer,
    getAnsweredExerciseIDs : getAnsweredExerciseIDs,
    getAnswersByInvitationUUID : getAnswersByInvitationUUID,
    createExecutedExercise : createExecutedExercise,
    existsExecutedExercise : existsExecutedExercise
}