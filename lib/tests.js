async function getTestsByAuthorName(authorName){

    let values = [authorName];
    let query = `
                SELECT uuid, id, name 
                FROM tests 
                WHERE author_id = (
                    SELECT id
                    FROM users
                    WHERE name = $1
                )`;

    let tests = (await Query(query, values)).rows;

    if(tests.length){
        return tests;
    } else {
        return undefined;
    }
}

module.exports = {
    getTestsByAuthorName : getTestsByAuthorName
}