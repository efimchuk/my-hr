const Users = require('../lib/users');

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
                WHERE test_id = $1 AND status = 1`;

    let invitations = (await Query(query, values)).rows;

    if(invitations.length){
        query = `SELECT *
                FROM users
                WHERE role = 2`;

        let users = (await Query(query)).rows;

        let _invitations = [];
        
        for(let i = 0; i < invitations.length; i++){
            users.forEach(function(element){
                if(element.name == this.uuid){
                    _invitations.push({
                        uuid : this.uuid,
                        id : this.id,
                        pin : element.password
                    });
                }
            }, invitations[i]);
        }

        return _invitations;
    } else {
        return [];
    }
}

async function createInvitationByTestID(testID){
    let pin = generatePIN();

    let values = [testID];
    let query = `INSERT INTO invitations (test_id)
                VALUES ($1)
                RETURNING *`;

    let invitations = (await Query(query, values)).rows;

    if(invitations.length){
        await Users.addNewUser(invitations[0].uuid, pin, 2);
        
        let invitation = {
            uuid : invitations[0].uuid,
            pin : pin
        };

        return invitation;
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
        await Users.deleteUser(uuid);

        return deleted[0].uuid;
    } else {
        return undefined;
    }
}

async function setExecutedByUUID(uuid){
    let values = [uuid];
    let query = `UPDATE invitations
                SET status = 2
                WHERE uuid = $1`;

    await Query(query, values);
}

async function getInvitationByID(id){
    let values = [id];
    let query = `SELECT * 
                FROM invitations
                WHERE id = $1`;

    let invitations = (await Query(query, values)).rows;

    if(invitations.length){
        return invitations[0];
    } else {
        return undefined;
    }
}

async function getInvitationByUUID(uuid){
    let values = [uuid];
    let query = `SELECT * 
                FROM invitations
                WHERE uuid = $1`;

    let invitations = (await Query(query, values)).rows;

    let newUser = await Users.getUserByName(uuid);

    invitations[0].pin = newUser.password;

    if(invitations.length){
        return invitations[0];
    } else {
        return undefined;
    }
}

module.exports = {
    getInvitationsByTestID : getInvitationsByTestID,
    createInvitationByTestID : createInvitationByTestID,
    deleteInvitationByUUID : deleteInvitationByUUID,
    setExecutedByUUID : setExecutedByUUID,
    getInvitationByID : getInvitationByID,
    getInvitationByUUID : getInvitationByUUID
}