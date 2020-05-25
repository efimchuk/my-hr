const Candidats = require('../lib/candidats');
const Tests = require('../lib/tests');
const Invitations = require('../lib/invitations');
const Executions = require('../lib/executions');

function executionReport(test, execution){
    let results = [];

    for(let i = 0; i < test.exercises.length; i++){
        let currentExercise = test.exercises[i];

        let currentAnswer = execution.answers.find(function(element){
            return element.id == this;
        }, currentExercise.id);

        if(currentAnswer == undefined){
            results.push({
                id : currentExercise.id,
                noData : true,
                pass : false,
                right : false,
                partially : false,
                wrong : false
            });
        } else {
            if(currentAnswer.pass){
                results.push({
                    id : currentExercise.id,
                    noData : false,
                    pass : true,
                    right : false,
                    partially : false,
                    wrong : false,
                    executing_time : Math.round(currentAnswer.executing_time)
                });

                continue;
            }

            switch(currentExercise.type){
                case 0:
                    results.push({
                        id : currentExercise.id,
                        noData : false,
                        pass : false,
                        right : currentExercise.rightAnswer == currentExercise.answer,
                        partially : false,
                        wrong : currentExercise.rightAnswer != currentExercise.answer,
                        executing_time : Math.round(currentAnswer.executing_time)
                    });
                    break;
                case 1:
                case 2:
                    let correctVariants = currentExercise.variants.filter(element => element.correct);

                    let selectedCount = currentAnswer.selected.length;

                    let selectedCorrectVariants = correctVariants.filter(function(element){
                        let finded = this.find(function(element){
                            return element == this;
                        }, element.id);

                        return finded != undefined;
                    }, currentAnswer.selected);
                    
                    if(selectedCorrectVariants.length == 0){
                        results.push({
                            id : currentExercise.id,
                            noData : false,
                            pass : false,
                            right : false,
                            partially : false,
                            wrong : true,
                            executing_time : Math.round(currentAnswer.executing_time)
                        });

                        continue;
                    }

                    if(selectedCorrectVariants.length < correctVariants.length){
                        results.push({
                            id : currentExercise.id,
                            noData : false,
                            pass : false,
                            right : false,
                            partially : true,
                            wrong : false,
                            executing_time : Math.round(currentAnswer.executing_time)
                        });

                        continue;
                    }

                    if(selectedCorrectVariants.length == correctVariants.length){

                        if(selectedCorrectVariants.length == selectedCount){
                            results.push({
                                id : currentExercise.id,
                                noData : false,
                                pass : false,
                                right : true,
                                partially : false,
                                wrong : false,
                                executing_time : Math.round(currentAnswer.executing_time)
                            });
    
                            continue;
                        } else {
                            results.push({
                                id : currentExercise.id,
                                noData : false,
                                pass : false,
                                right : false,
                                partially : true,
                                wrong : false,
                                executing_time : Math.round(currentAnswer.executing_time)
                            });
    
                            continue;
                        }
                    }

                    break;
            }
        }
    }

    return results;
}

async function createVacancy(vacancy, author_id){
    let values = [vacancy.name, vacancy.description, vacancy.experience_time, author_id];
    let query = `INSERT INTO vacancies (name, description, experience_time, author_id)
                VALUES ($1, $2, $3, (
                    SELECT id
                    FROM users
                    WHERE uuid = $4))
                RETURNING *`;

    let vacancies = (await Query(query, values)).rows;
    
    if(vacancies.length){
        let vacancy = vacancies[0];

        return vacancy;
    } else {
        return undefined;
    }
}

async function getVacancyByUUID(uuid){
    let values = [uuid];
    let query = `SELECT *
                FROM vacancies
                WHERE uuid = $1`;

    let vacancies = (await Query(query, values)).rows;
    
    if(vacancies.length){
        let vacancy = vacancies[0];

        if(vacancy.test_id != null){
            values = [vacancy.test_id];
            query = `SELECT uuid
                    FROM tests
                    WHERE id = $1`;

            let tests = (await Query(query, values)).rows;

            if(tests.length){
                let testUUID = tests[0].uuid;

                let test = await Tests.getTestByUUID(testUUID);

                vacancy.test_uuid = test.uuid;
                vacancy.test_name = test.name;
            }
        }

        vacancy.candidats = await Candidats.getCandidatsByVacancyUUID(vacancy.uuid);

        if(vacancy.test_uuid != undefined){
            let invitations = await Invitations.getInvitationsByTestID(vacancy.test_id);

            vacancy.invitations = invitations.filter(function(invitation){
                let finded = vacancy.candidats.find(function(candidat){
                    if(candidat.invitation_id == null){
                        return false;
                    }

                    if(candidat.invitation_id == this){
                        candidat.invited = true;
                        return true;
                    } else {
                        return false;
                    }
                }, invitation.id);

                if(finded != undefined){
                    invitation.invited = finded;
                    return true;
                } else {
                    return false;
                }
            });


            let executions = await Executions.getExecutionsByTestUUID(vacancy.test_uuid);

            vacancy.executions = executions.filter(function(execution){
                let finded = vacancy.candidats.find(function(candidat){
                    if(candidat.invitation_id == null){
                        return false;
                    }

                    if(candidat.invitation_id == this){
                        candidat.executed = true;
                        return true;
                    } else {
                        return false;
                    }
                }, execution.id);

                if(finded != undefined){
                    execution.executed = finded;
                    return true;
                } else {
                    return false;
                }
            })

            vacancy.statistics = [];
            
            let currentTest = await Tests.getTestByUUID(vacancy.test_uuid);

            for(let i = 0; i < vacancy.executions.length; i++){
                let statisticsElement = {};

                let currentExecutionPreview = vacancy.executions[i];

                let currentExecution = await Executions.getExecutionByUUID(currentExecutionPreview.uuid);

                let currentExecutor = vacancy.candidats.find(function(element){
                    return element.invitation_id == this;
                }, currentExecution.id);

                let _executionReport = executionReport(currentTest, currentExecution);

                statisticsElement = {
                    id : currentExecutor.id,
                    name : currentExecutor.name,
                    answers : _executionReport,
                    passedCount : _executionReport.filter(element => element.pass).length,
                    noDataCount : _executionReport.filter(element => element.noData).length,
                    rightCount : _executionReport.filter(element => element.right).length,
                    partiallyCount : _executionReport.filter(element => element.partially).length,
                    wrongCount : _executionReport.filter(element => element.wrong).length,
                    executing_time : _executionReport.filter(element => !element.noData).map(element => element.executing_time).reduce(function(accumulator, currentValue){return accumulator + currentValue}, 0)
                }

                vacancy.statistics.push(statisticsElement);
            }


        } else {
            vacancy.invitations = [];
            vacancy.executions = [];
        }

        return vacancy;
    } else {
        return undefined;
    }
}

async function editVacancy(vacancy){
    let values = [vacancy.name, vacancy.description, vacancy.experience_time, vacancy.id];
    let query = `UPDATE vacancies
                SET name = $1, description = $2, experience_time = $3 
                WHERE id = $4
                RETURNING *`;

    let vacancies = (await Query(query, values)).rows;

    if(vacancies.length){
        let vacancy = vacancies[0];

        return vacancy;
    } else {
        return undefined;
    }
}

async function getVacanciesByAuthorUUID(uuid){
    let values = [uuid];
    let query = `SELECT *
                FROM vacancies
                WHERE author_id IN (
                    SELECT id
                    FROM users
                    WHERE uuid = $1
                )`;

    let vacancies = (await Query(query, values)).rows;

    if(vacancies.length){
        return vacancies;
    } else {
        return [];
    }
}

async function deleteVacancyByUUID(uuid){
    let values = [uuid];
    let query = `DELETE FROM vacancies 
                WHERE uuid = $1
                RETURNING *`;

    let deleted = (await Query(query, values)).rows;

    if(deleted.length){
        return deleted[0].uuid;
    } else {
        return undefined;
    }
}

async function addTestToVacancy(testID, vacancyUUID){
    let values = [testID, vacancyUUID];
    let query = `UPDATE vacancies
                SET test_id = $1
                WHERE uuid = $2`;

    await Query(query, values);
}

async function deleteTestToVacancy(vacancyUUID){
    let values = [vacancyUUID];
    let query = `WITH d AS (
                    DELETE FROM tests
                    WHERE id IN (
                        SELECT test_id
                        FROM vacancies
                        WHERE uuid = $1
                    ))
                UPDATE vacancies
                SET test_id = NULL
                WHERE uuid = $1`;

    await Query(query, values);
}

module.exports = {
    createVacancy : createVacancy,
    getVacancyByUUID : getVacancyByUUID,
    editVacancy : editVacancy,
    getVacanciesByAuthorUUID : getVacanciesByAuthorUUID,
    deleteVacancyByUUID : deleteVacancyByUUID,
    addTestToVacancy : addTestToVacancy,
    deleteTestToVacancy : deleteTestToVacancy
}