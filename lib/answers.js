async function saveAnswer(executedExercise, invitationUUID){
    let values = [];
    let query = '';

    if(executedExercise.pass){
        values = [invitationUUID, executedExercise.id];
        query = `INSERT INTO answers (invitation_id, exercise_id, pass)
                    VALUES ((SELECT id FROM invitations WHERE uuid = $1), $2, TRUE)`;

        await Query(query, values);
        return;
    }

    switch(executedExercise.type){
        case 0: 
        case 3: 

            values = [invitationUUID, executedExercise.id, executedExercise.answer];
            query = `INSERT INTO answers (invitation_id, exercise_id, pass, text)
                        VALUES ((SELECT id FROM invitations WHERE uuid = $1), $2, FALSE, $3)`;

            await Query(query, values);
            break;
        case 1: 
        case 2: 

            values = [invitationUUID, executedExercise.id];
            query = `INSERT INTO answers (invitation_id, exercise_id, pass, variant_id)
                        VALUES <<values>>`;
                        
            let _values = executedExercise.selected.map(element => `((SELECT id FROM invitations WHERE uuid = $1), $2, FALSE, ${element})`).join(',');
             
            query = query.replace('<<values>>', _values);
            await Query(query, values);
            break;
        break;
    }
}

async function getAnsweredExerciseIDs(uuid){
    let values = [uuid];
    let query = `SELECT exercise_id
            FROM answers
            WHERE invitation_id IN (
                SELECT id
                FROM invitations
                WHERE uuid = $1
            )
            GROUP BY exercise_id`;

    let result = (await Query(query, values)).rows.map(element => element.exercise_id);

    return result;
}

async function getAnswersByInvitationUUID(uuid){
    let values = [uuid];
    let query = `SELECT *
                FROM answers
                WHERE invitation_id IN (
                    SELECT id
                    FROM invitations
                    WHERE uuid = $1
                )`;

    let answers = (await Query(query, values)).rows;

    return answers;
}

module.exports = {
    saveAnswer : saveAnswer,
    getAnsweredExerciseIDs : getAnsweredExerciseIDs,
    getAnswersByInvitationUUID : getAnswersByInvitationUUID
}