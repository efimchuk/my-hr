async function getCandidatsByVacancyUUID(vacancyUUID){
    let values = [vacancyUUID];
    let query = `SELECT *
                FROM candidats
                WHERE vacancy_id IN (
                    SELECT id
                    FROM vacancies
                    WHERE uuid = $1
                )`;

    let candidats = (await Query(query, values)).rows;

    if(candidats.length){
        return candidats;
    } else {
        return [];
    }
}
async function createCandidatForVacancyUUID(candidat, vacancyUUID){
    let values = [candidat.name, candidat.phone, candidat.description, vacancyUUID];
    let query = `INSERT INTO candidats (name, phone, description, vacancy_id)
                VALUES ($1, $2, $3, (SELECT id FROM vacancies WHERE uuid = $4))
                RETURNING *`;

    let candidats = (await Query(query, values)).rows;

    if(candidats.length){
        return candidats[0];
    } else {
        return [];
    }
}

async function getCandidatByID(id){
    let values = [id];
    let query = `SELECT *
                FROM candidats
                WHERE id = $1`;

    let candidats = (await Query(query, values)).rows;

    if(candidats.length){
        return candidats[0];
    } else {
        return undefined;
    }
}

async function editCandidat(candidat){

    let values = [candidat.name, candidat.phone, candidat.description, candidat.id];
    let query = `UPDATE candidats
                SET name = $1, phone = $2, description = $3
                WHERE id = $4
                RETURNING *`;

    let candidats = (await Query(query, values)).rows;

    if(candidats.length){
        return candidats[0];
    } else {
        return [];
    }

}
async function deleteCandidat(candidatID){
    let values = [candidatID];
    let query = `DELETE FROM candidats
                WHERE id = $1
                RETURNING *`;

    let candidats = (await Query(query, values)).rows;
    
    if(candidats.length){
        return candidats[0].id;
    } else {
        return undefined;
    }
}

async function addInvitation(candidatID, invitationUUID){
    let values = [candidatID, invitationUUID];
    let query = `UPDATE candidats
                SET invitation_id = (
                    SELECT id
                    FROM invitations
                    WHERE uuid = $2)
                WHERE id = $1`;

    await Query(query, values);
}

async function deleteInvitation(candidatID){
    let values = [candidatID];
    let query = `UPDATE candidats
                SET invitation_id = NULL
                WHERE id = $1`;

    await Query(query, values);
}

module.exports = {
    getCandidatsByVacancyUUID : getCandidatsByVacancyUUID,
    createCandidatForVacancyUUID : createCandidatForVacancyUUID,
    editCandidat : editCandidat,
    deleteCandidat : deleteCandidat,
    getCandidatByID : getCandidatByID,
    addInvitation : addInvitation,
    deleteInvitation : deleteInvitation
}