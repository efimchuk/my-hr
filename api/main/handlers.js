const fs = require('fs');
const Users = require('../../lib/users');

async function main_get(ctx, next){
    let authorName = ctx.cookies.get('user');

    if(authorName != undefined){
        ctx.redirect('/tests');
        return;
    }

    ctx.body = String(fs.readFileSync(__dirname + '/static/index.html'));
}

async function auth_get(ctx, nest){
    ctx.body = String(fs.readFileSync(__dirname + '/static/auth.html'));
}

async function auth_post(ctx, nest){
    let body = ctx.request.body;

    if(body.authMode){
        let user = await Users.getUserByName(body.username);
            
        if(user != undefined){
            ctx.status = 400;
            ctx.body = 'Указанное име пользователя уже занято';
            return;
        } else {
            let newUser = Users.addNewUser(body.username, body.password, 1);

            ctx.cookies.set('user', newUser.name);
            ctx.status = 301;
            ctx.redirect('/tests');
            return;
        }
    } else {
        let user = await Users.getUserByName(body.username);

        if(user != undefined){
            if(user.password == body.password){
                ctx.cookies.set('user', user.name);
                ctx.status = 301;
                ctx.redirect('/tests');
                return;
            } else {
                ctx.status = 400;
                ctx.body = 'Неправильный пароль';
                return;
            }
        } else {
            ctx.status = 400;
            ctx.body = 'Пользователь с указанным имененем не зарегистрирован';
            return;
        }
    }
}

async function auth_delete(ctx, nest){
    ctx.cookies.set('user', '0', {expires : new Date()})
    ctx.redirect('/');
}

module.exports = {
    main_get : main_get,
    auth_get : auth_get,
    auth_post : auth_post,
    auth_delete : auth_delete,
}