const Tests = require('../lib/tests');

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

module.exports = {
    getExecutionsByTestUUID : getExecutionsByTestUUID
}