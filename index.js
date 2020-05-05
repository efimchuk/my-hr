const http = require('http');
const PORT = process.env.PORT || 4000; // To support launching in Heroku environment
const fs = require('fs');

(async ()=>{
    const requestHandler = (request, response) => {
        switch(request.method){
            case "GET":
                switch(request.url){
                    case "/":
                        let indexPage = (fs.readFileSync('./index.html')).toString('utf-8');
                        response.end(indexPage);
                        break;
                    default:
                        response.end('Unsupported');
                }
                break;
            default:
                response.end('Unsupported');
        }
    }
    
    const server = http.createServer(requestHandler);
    
    server.listen(PORT, (err) => {
        if (err) {
            return console.log('something bad happened', err)
        }
        console.log(`server is listening on ${PORT}`)
    });
})();