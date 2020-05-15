async function getUserByName(name){
    let values = [name];
    let query = `SELECT * FROM users WHERE name = $1`;

    let users = (await Query(query, values)).rows;

    if(users.length){
        return users[0];
    } else {
        return undefined;
    }
}

async function addNewUser(name, password, role){

    if(password == undefined){
        password = Date.now().toString().substr(7,6);
    }

    let values = [name, password, role];
    let query = `INSERT INTO users (name, password, role)
                    VALUES ($1, $2, $3)
                    RETURNING *;`

    let users = (await Query(query, values)).rows;

    if(users.length){
        return users[0];
    } else {
        return undefined;
    }
}

async function deleteUser(name){
    let values = [name];
    let query = `DELETE FROM users 
                WHERE name = $1
                RETURNING *`;

    let users = (await Query(query, values)).rows;

    if(users.length){
        return users[0];
    } else {
        return undefined;
    }
}

module.exports = {
    getUserByName : getUserByName,
    addNewUser : addNewUser,
    deleteUser : deleteUser
}