function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
}

function generatePIN(){
    let result = '';
    
    for(let i = 0; i < 6; i++){
        result += String(getRandomIntInclusive(0, 9));
    }

    return result;
}

async function getInvitationsByTestID(testID){
    let values = [testID];
    let query = `SELECT * 
                FROM invitations
                WHERE test_id = $1`;

    let invitations = (await Query(query, values)).rows;

    if(invitations.length){
        return invitations;
    } else {
        return [];
    }
}

async function createInvitationByTestID(testID){
    let pin = generatePIN();

    let values = [testID, pin];
    let query = `INSERT INTO invitations (pin, test_id)
                VALUES ($2, $1)
                RETURNING *`;

    let invitations = (await Query(query, values)).rows;

    if(invitations.length){
        return invitations[0];
    } else {
        return undefined;
    }
}

async function deleteInvitationByUUID(uuid){
    let values = [uuid];
    let query = `DELETE FROM invitations
                WHERE uuid = $1
                RETURNING *`;

    let deleted = (await Query(query, values)).rows;

    if(deleted.length){
        return deleted[0].uuid;
    } else {
        return undefined;
    }
}

module.exports = {
    getInvitationsByTestID : getInvitationsByTestID,
    createInvitationByTestID : createInvitationByTestID,
    deleteInvitationByUUID : deleteInvitationByUUID
}