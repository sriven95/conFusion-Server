const express = require('express');
const bodyParser = require('body-parser');

const leaderRouter = express.Router();
leaderRouter.use(bodyParser.json());
leaderRouter.route('/')//we declare end point at one location
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type','text/plain');
    next();//continue to look for addtional end points
})
.get((req,res,next) =>{
    res.end('Well send all the leaders to you!');
})
.put((req,res,next) =>{
    res.statusCode = 403;//not supported  
    res.end('PUT operation not supported on /leaders');
})


.post((req,res,next) =>{
    res.end('Will add the leader: '+ req.body.name+' with details: '+req.body.description);//extracting name and description for the body
})
.delete((req,res,next) =>{
    res.end('Deleting all leaders!');
});
leaderRouter.route('/:leaderId')
.get((req,res,next) =>{
    res.end('Well send details of the leader: '+req.params.leaderId+" to you!");//params-parameters
})
.post((req,res,next) =>{
    res.statusCode = 403;
    res.end('POST operation not supported on /leaders/'+req.params.leaderId);//extracting name and description for the body
})

.put((req,res,next) =>{
    res.write('Updating the leader: ' + req.params.leaderId+'\n');
    res.end('Will update the leader: '+req.body.name+' with details '+req.body.description);
})

.delete((req,res,next) =>{
    res.end('Deleting leader: '+req.params.leaderId);
});


module.exports = leaderRouter;//exports everything