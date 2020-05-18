const Exercises = require('./exercises');
const Variants = require('./variants');
const Invitations = require('./invitations');
const Executions = require('./executions');

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

async function addTest(test, authorName){
    let values = [test.name, authorName];
    let query = `INSERT INTO tests (id, name, author_id) 
                VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM tests), $1, (SELECT id FROM users WHERE name = $2)) 
                RETURNING *`; 

    let tests = (await Query(query, values)).rows;

    let _test = {};

    if(tests.length){
        _test = tests[0];
    } else {
        return undefined;
    }

    _test.exercises = [];

    for(let i = 0; i < test.exercises.length; i++){
        let newExercise = await Exercises.saveExercise(test.exercises[i], _test.id);
        _test.exercises.push(newExercise);
    }

    return _test;
}

async function editTest(test){
    let currentTest = await getTestByUUID(test.uuid);

    if(currentTest.name != test.name){
        let values = [test.name, currentTest.id];
        let query = `UPDATE tests SET name = $1 WHERE id = $2`;

        await Query(query, values);
    }

    // Если есть задание, которого нет в новой версии теста, то это задание удаляется в базе
    for(let i = 0; i < currentTest.exercises.length; i++){
        let exercise = currentTest.exercises[i];

        let finded = test.exercises.find(function(element){
            if(element.id != undefined){
                return element.id == this;
            } else
                return false;
        }, exercise.id);

        if(finded == undefined){
            await Exercises.deleteExercise(exercise.id);
        }
    }
    
    // обрабатываются все задания новой версии теста
    for(let e = 0; e < test.exercises.length; e ++){
        let exercise = test.exercises[e];

        // если нет id то это новое задание 
        if(exercise.id == undefined){
            await Exercises.saveExercise(exercise, test.id);
            continue;
        }
        
        let finded = currentTest.exercises.find(function(element){
            return element.id == this;
        }, exercise.id);

        if(exercise.text != finded.text || exercise.type != finded.type){
            values = [exercise.text, exercise.type, exercise.id];
            query = `UPDATE exercises
                    SET text = $1, type = $2
                    WHERE id = $3
                    RETURNING *
                    `;

            await Query(query, values);
        }

        if(exercise.type == 0){
            if(finded.type == 0) {
                values = [exercise.id];
                query = `SELECT * 
                        FROM variants 
                        WHERE exercise_id = $1`;
                
                let variants = (await Query(query, values)).rows;

                let variant = {};

                if(variants.length){
                    variant = variants[0];
                    await Variants.editVariant(variant.id, exercise.rightAnswer, true);
                } else {
                    await Variants.saveVariants(exercise.id, [{correct : true, text : exercise.rightAnswer}]);
                }
            } else {
                let variantIds = finded.variants.map(element => element.id);
                await Variants.deleteVariants(variantIds);
                await Variants.saveVariants(exercise.id, [{correct : true, text : exercise.rightAnswer}]);
            }
        } else {
            if(finded.type == 0){
                values = [finded.id];
                query = `SELECT * 
                        FROM variants 
                        WHERE exercise_id = $1`;
                
                let variants = (await Query(query, values)).rows;

                if(variants.length){
                    await Variants.deleteVariants(variants.map(element => element.id));
                }
            }

            for(let i = 0; i < finded.variants.length; i++){
                let variant = finded.variants[i];

                let findedVariant = exercise.variants.find(function(variant){
                    if(variant.id != undefined){
                        return variant.id == this;
                    } else {
                        return false;
                    }
                }, variant.id);

                if(findedVariant == undefined){
                    await Variants.deleteVariants([variant.id]);
                }
            }

            for(let i = 0; i < exercise.variants.length; i++){
                let variant = exercise.variants[i];

                if(variant.id == undefined){
                    await Variants.saveVariants(exercise.id, [{correct : variant.correct, text : variant.text}]);
                } else {
                    let findedVariant = finded.variants.find(function (variant){return variant.id == this}, variant.id);

                    if(findedVariant == undefined){
                        await Variants.saveVariants(exercise.id, [{correct : variant.correct, text : variant.text}]);
                    } else {
                        await Variants.editVariant(findedVariant.id, variant.text, variant.correct);
                    }
                }
            }
        }
    }
}

async function getTestByUUID(uuid){
    let values = [uuid];
    let query = `SELECT * FROM tests WHERE uuid = $1`;

    let tests = (await Query(query, values)).rows;

    let test = {};

    if(tests.length){
        test = tests[0];
    } else {
        return undefined;
    }

    test.exercises = [];

    values = [test.id];
    query = `SELECT * FROM exercises WHERE test_id = $1`;
    let exercises = (await Query(query, values)).rows;

    for(let i = 0; i < exercises.length; i++){
        values = [exercises[i].id];
        query = `SELECT * FROM variants WHERE exercise_id = $1`;
        let variants = (await Query(query, values)).rows;

        exercises[i].variants = [];

        if(exercises[i].type == 0){
            exercises[i].rightAnswer = variants[0].text;
        } else {
            exercises[i].variants = variants;
        }

        test.exercises.push(exercises[i]);
    }

    test.invitations = await Invitations.getInvitationsByTestID(test.id);
    test.executions = await Executions.getExecutionsByTestUUID(test.uuid);

    return test;
}

async function getTestByID(id){
    let values = [id];
    let query = `SELECT * FROM tests WHERE id = $1`;

    let tests = (await Query(query, values)).rows;

    let test = {};

    if(tests.length){
        test = tests[0];
    } else {
        return undefined;
    }

    test.exercises = [];

    values = [test.id];
    query = `SELECT * FROM exercises WHERE test_id = $1`;
    let exercises = (await Query(query, values)).rows;

    for(let i = 0; i < exercises.length; i++){
        values = [exercises[i].id];
        query = `SELECT * FROM variants WHERE exercise_id = $1`;
        let variants = (await Query(query, values)).rows;

        exercises[i].variants = [];

        if(exercises[i].type == 0){
            exercises[i].rightAnswer = variants[0].text;
        } else {
            exercises[i].variants = variants;
        }

        test.exercises.push(exercises[i]);
    }

    test.invitations = await Invitations.getInvitationsByTestID(test.id);
    test.executions = await Executions.getExecutionsByTestUUID(test.uuid);

    return test;
}

async function deleteByUUID(uuid){
    let values = [uuid];
    let query = `DELETE FROM tests 
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
    getTestsByAuthorName : getTestsByAuthorName,
    addTest : addTest,
    editTest : editTest,
    getTestByUUID : getTestByUUID,
    deleteByUUID : deleteByUUID,
    getTestByID : getTestByID
}