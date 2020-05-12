async function main_path(ctx, next){
    ctx.body = 'GET /';
}

async function auth_path(ctx, nest){
    ctx.body = 'GET /auth';
}

async function auth_post(ctx, nest){
    ctx.cookies.set('session', 'kek', { expires : Date.now() + 1000*60*60*24*2, signed: true })
    ctx.body = 'POST /auth';
}

async function auth_delete(ctx, nest){
    ctx.cookies.set('session', 'kek', { expires : Date.now() - 1000*60*60*24*2, signed: true })
    ctx.body = 'DELETE /auth';
}

module.exports = {
    main_get : main_get,
    auth_get : auth_get,
    auth_post : auth_post,
    auth_delete : auth_delete,
}