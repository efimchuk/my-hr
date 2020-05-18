const fs = require('fs');
const Vacancies = require('../../lib/vacancies');
const TestsHandlers = require('../tests/handlers');
const Tests = require('../../lib/tests');
const Candidats = require('../../lib/candidats');
const Invitations = require('../../lib/invitations');
const Executions = require('../../lib/executions');

async function vacancies_get(ctx, next){
    if(ctx.query.json == undefined){
        ctx.body = String(fs.readFileSync(__dirname + '/static/vacancies.html'));
    } else {
        let vacancies = await Vacancies.getVacanciesByAuthorUUID(ctx.currentUser.uuid);

        ctx.status = 200;
        ctx.body = JSON.stringify(vacancies);
    }
}

async function vacancies_uuid_get(ctx, next){
    if(ctx.query.json == undefined){
        ctx.body = String(fs.readFileSync(__dirname + '/static/vacancy.html'));
    } else {
        let currentVacancy = {};

        if(ctx.params.uuid == 'new'){
            currentVacancy = undefined;
        } else {
            let vacancies = await Vacancies.getVacanciesByAuthorUUID(ctx.currentUser.uuid);

            currentVacancy = vacancies.find(function (element, index, array){
                if(element.uuid == this){
                    return true;
                }

                return false;
            }, ctx.params.uuid);
        }

        if(currentVacancy == undefined){
            if(ctx.params.uuid == 'new'){
                currentVacancy = {};
                currentVacancy.id = 'new';
                currentVacancy.viewMode = 0;
                ctx.status = 204;
                ctx.body = JSON.stringify(currentVacancy);
                return;
            } else {
                ctx.status = 404;
                ctx.body = 'Страница не найдена';
                return;
            }
        } else {
            currentVacancy = await Vacancies.getVacancyByUUID(ctx.params.uuid);
            currentVacancy.viewMode = 1;
            ctx.status = 200;
            ctx.body = JSON.stringify(currentVacancy);
            return;
        }
    }
}

async function vacancies_post(ctx, next){
    let vacancy = ctx.request.body;
    if(vacancy.id == undefined || vacancy.id == 'new'){
        vacancy = await Vacancies.createVacancy(ctx.request.body, ctx.currentUser.uuid);
    } else {
        vacancy = await Vacancies.editVacancy(ctx.request.body);
    }

    vacancy.viewMode = 1;
    ctx.body = vacancy;
}

async function vacancies_uuid_delete(ctx, next){
    let vacancies = await Vacancies.getVacanciesByAuthorUUID(ctx.currentUser.uuid);

    let currenctVacancy = vacancies.find(function(vacancy){return vacancy.uuid == this}, ctx.params.uuid);

    if(currenctVacancy != undefined){
        let deletedUUID = await Vacancies.deleteVacancyByUUID(ctx.params.uuid);

        if(deletedUUID == undefined){
            ctx.status = 502;
        } else {
            ctx.status = 200;
            ctx.body = deletedUUID;
        }
    } else {
        ctx.status = 404;
        ctx.body = 'Вакансия не найдена';
        ctx.redirect('back');
    }
}

async function vacancies_uuid_test_get(ctx, next){
    let vacancy = await Vacancies.getVacancyByUUID(ctx.params.uuid);

    // Надо переделать \

    if(vacancy.test_uuid == undefined){
        ctx.params.uuid = 'new';
    } else {
        ctx.params.uuid = vacancy.test_uuid;
    }

    await TestsHandlers.tests_uuid_get(ctx, next);

    // надо переделать /

    if(ctx.query.json == undefined){
        ctx.body = String(fs.readFileSync(__dirname + '/static/test.html'));
    }
}

async function vacancies_uuid_test_post(ctx, next){
    let test = ctx.request.body;
    if(test.id == undefined || test.id == 'new'){
        test = await Tests.addTest(ctx.request.body, ctx.currentUser.name);
    } else {
        await Tests.editTest(ctx.request.body);
    }

    test.viewMode = 1;

    if(ctx.request.body.id == 'new'){
        await Vacancies.addTestToVacancy(test.id, ctx.params.uuid);
    }

    ctx.body = test;
}
async function vacancies_uuid_test_delete(ctx, next){
    await Vacancies.deleteTestToVacancy(ctx.params.uuid);

    ctx.status = 202;
}
async function vacancies_uuid_candidats_get(ctx, next){
    // if(ctx.query.json == undefined){
    //     ctx.body = String(fs.readFileSync(__dirname + '/static/candidat.html'));
    // } else {
    //     let currentCandidat = {};

    //     if(ctx.params.id == 'new'){
    //         currentCandidat = undefined;
    //     } else {
    //         let candidats = await Candidats.getCandidatsByVacancyUUID(ctx.params.uuid);

    //         currentCandidat = candidats.find(function (element, index, array){
    //             if(element.id == this){
    //                 return true;
    //             }

    //             return false;
    //         }, ctx.params.candidatsID);
    //     }

    //     if(currentCandidat == undefined){
    //         if(ctx.params.id == 'new'){
    //             currentCandidat = {};
    //             currentCandidat.id = 'new';
    //             currentCandidat.viewMode = 0;
    //             ctx.status = 204;
    //             ctx.body = JSON.stringify(currentVacancy);
    //             return;
    //         } else {
    //             ctx.status = 404;
    //             ctx.body = 'Страница не найдена';
    //             return;
    //         }
    //     } else {
    //         currentCandidat = await Candidats.getCandidatByID(ctx.params.uuid);
    //         currentCandidat.viewMode = 1;
    //         ctx.status = 200;
    //         ctx.body = JSON.stringify(currentCandidat);
    //         return;
    //     }
    // }
}
async function vacancies_uuid_candidats_post(ctx, next){}
async function vacancies_uuid_candidats_uuid_get(ctx, next){
    if(ctx.query.json == undefined){
        ctx.body = String(fs.readFileSync(__dirname + '/static/candidat.html'));
    } else {
        let currentCandidat = {};

        if(ctx.params.candidatsID == 'new'){
            currentCandidat = undefined;
        } else {
            let candidats = await Candidats.getCandidatsByVacancyUUID(ctx.params.uuid);

            currentCandidat = candidats.find(function (element, index, array){
                if(element.id == this){
                    return true;
                }

                return false;
            }, ctx.params.candidatsID);
        }

        if(currentCandidat == undefined){
            if(ctx.params.id == 'new'){
                currentCandidat = {};
                currentCandidat.id = 'new';
                currentCandidat.viewMode = 0;
                ctx.status = 204;
                ctx.body = JSON.stringify(currentVacancy);
                return;
            } else {
                ctx.status = 404;
                ctx.body = 'Страница не найдена';
                return;
            }
        } else {
            currentCandidat = await Candidats.getCandidatByID(ctx.params.candidatsID);
            currentCandidat.viewMode = 1;
            ctx.status = 200;
            ctx.body = JSON.stringify(currentCandidat);
            return;
        }
    }
}
async function vacancies_uuid_candidats_uuid_post(ctx, next){
    let candidat = ctx.request.body;
    if(candidat.id == undefined || candidat.id == 'new'){
        candidat = await Candidats.createCandidatForVacancyUUID(ctx.request.body, ctx.params.uuid);
    } else {
        candidat = await Candidats.editCandidat(ctx.request.body);
    }

    candidat.viewMode = 1;
    ctx.body = candidat;
}
async function vacancies_uuid_candidats_uuid_delete(ctx, next){
    let candidatId = ctx.params.candidatsID;

    let deletedId = await Candidats.deleteCandidat(candidatId);

    if(deletedId == undefined){
        ctx.status = 502;
    } else {
        ctx.status = 200;
        ctx.body = deletedId;
    }
}
async function vacancies_uuid_candidats_uuid_invitation_get(ctx, next){
    if(ctx.query.json){

    } else {

    }
}
async function vacancies_uuid_candidats_uuid_invitation_post(ctx, next){
    let currentVacancy = await Vacancies.getVacancyByUUID(ctx.params.uuid);

    if(currentVacancy.test_id != null){
        let test = await Tests.getTestByUUID(currentVacancy.test_uuid);

        if(test != undefined){
            let invitation = await Invitations.createInvitationByTestID(test.id);

            invitation = await Invitations.getInvitationByUUID(invitation.uuid);

            ctx.status = 201;
            ctx.body = invitation;

            let candidatID = ctx.params.candidatsID;

            await Candidats.addInvitation(candidatID, invitation.uuid);

            return;
        }
    }

    ctx.status = 400;
}
async function vacancies_uuid_candidats_uuid_invitation_delete(ctx, next){
    let candidatsID = ctx.params.candidatsID;

    let currentCandidat = await Candidats.getCandidatByID(candidatsID);

    let currentInvitation = await Invitations.getInvitationByID(currentCandidat.invitation_id);

    await Candidats.deleteInvitation(currentCandidat.id);

    await Invitations.deleteInvitationByUUID(currentInvitation.uuid);

    ctx.status = 202;
    ctx.body = currentInvitation;
}
async function vacancies_uuid_candidats_uuid_execution_get(ctx, next){
    let candidatID = ctx.params.candidatsID;

    let candidat = await Candidats.getCandidatByID(candidatID);

    let execution = await Executions.getExecutionByID(candidat.invitation_id);

    let testID = execution.test_id;

    let test = await Tests.getTestByID(testID);

    ctx.params.testUUID = test.uuid;
    ctx.params.executionUUID = execution.uuid;

    // Надо переделать \

    await TestsHandlers.tests_uuid_executions_uuid_get(ctx, next);

    // надо переделать /
}
async function vacancies_uuid_candidats_uuid_execution_post(ctx, next){}
async function vacancies_uuid_candidats_execution_uuid_delete(ctx, next){}

module.exports = {
    vacancies_get : vacancies_get,
    vacancies_post : vacancies_post,
    vacancies_uuid_get : vacancies_uuid_get,
    vacancies_uuid_delete : vacancies_uuid_delete,
    vacancies_uuid_test_get : vacancies_uuid_test_get,
    vacancies_uuid_test_post : vacancies_uuid_test_post,
    vacancies_uuid_test_delete : vacancies_uuid_test_delete,
    // vacancies_uuid_candidats_get : vacancies_uuid_candidats_get,
    // vacancies_uuid_candidats_post : vacancies_uuid_candidats_post,
    vacancies_uuid_candidats_uuid_get : vacancies_uuid_candidats_uuid_get,
    vacancies_uuid_candidats_uuid_post : vacancies_uuid_candidats_uuid_post,
    vacancies_uuid_candidats_uuid_delete : vacancies_uuid_candidats_uuid_delete,
    // vacancies_uuid_candidats_uuid_invitation_get : vacancies_uuid_candidats_uuid_invitation_get,
    vacancies_uuid_candidats_uuid_invitation_post : vacancies_uuid_candidats_uuid_invitation_post,
    vacancies_uuid_candidats_uuid_invitation_delete : vacancies_uuid_candidats_uuid_invitation_delete,
    vacancies_uuid_candidats_uuid_execution_get : vacancies_uuid_candidats_uuid_execution_get,
    // vacancies_uuid_candidats_uuid_execution_post : vacancies_uuid_candidats_uuid_execution_post, 
    // vacancies_uuid_candidats_execution_uuid_delete : vacancies_uuid_candidats_execution_uuid_delete
}