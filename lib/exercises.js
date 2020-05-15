const Variants = require('./variants');

async function saveExercise(exercise, textId){
    let values = [exercise.text, exercise.type, textId];
    let query = `INSERT INTO exercises (text, type, test_id)
                VALUES ($1, $2, $3)
                RETURNING *`;

    let exercises = (await Query(query, values)).rows;

    let newExercise = {};

    if(exercises.length){
        newExercise = exercises[0];
    } else {
        return undefined;
    }

    if(exercise.type == 0){
        newExercise.variants = await Variants.saveVariants(newExercise.id, [{correct: true, text:exercise.rightAnswer}]);
    } else {
        newExercise.variants = await Variants.saveVariants(newExercise.id, exercise.variants);
    }

    return exercise;
}

async function deleteExercise(exerciseId){
    let values = [exerciseId];
    let query = `DELETE FROM exercises 
                WHERE id = $1
                RETURNING *`;

    let exercises = (await Query(query, values)).rows;

    if(exercises.length){
        return exercises[0];
    } else {
        return undefined;
    }
}

module.exports = {
    saveExercise : saveExercise,
    deleteExercise : deleteExercise
}