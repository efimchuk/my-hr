async function saveVariants(exerciseId, variants){
    let query = `INSERT INTO variants(exercise_id, correct, text)
                VALUES <<values>>
                RETURNING *`;

    let _values = variants
        .map(function(element, index, array){return `(${this}, ${element.correct}, '${element.text}')`}, exerciseId);
    _values = _values.join(',');

    values = [];
    query = query.replace('<<values>>', _values);

    let _variants = (await Query(query, values)).rows;

    if(_variants.length){
        return _variants;
    } else {
        return undefined;
    }
}

async function deleteVariants(variantIds){
    let query = `DELETE FROM variants
                WHERE id IN (<<values>>)
                RETURNING *`; 

    let _values = variantIds
        .map(function(element, index, array){return `${element}`});
    _values = _values.join(',');

    values = [];
    query = query.replace('<<values>>', _values);

    let _variants = (await Query(query, values)).rows;

    if(_variants.length){
        return _variants;
    } else {
        return undefined;
    }
}

async function editVariant(id, text, correct){
    let values = [id, text, correct];
    let query = `UPDATE variants 
                SET text = $2, correct = $3
                WHERE id = $1
                RETURNING *`;

    await Query(query, values);
}

module.exports = {
    editVariant : editVariant,
    deleteVariants : deleteVariants, 
    saveVariants : saveVariants
}