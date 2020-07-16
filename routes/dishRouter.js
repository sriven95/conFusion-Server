const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());
dishRouter.route('/')//we declare end point at one location
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type','text/plain');
    next();//continue to look for addtional end points
})
.get((req,res,next) =>{
    res.end('Well send all the dishes to you!');
})

.post((req,res,next) =>{
    res.end('Will add the dish: '+ req.body.name+' with details: '+req.body.description);//extracting name and description for the body
})
.put((req,res,next) =>{
    res.statusCode = 403;//not supported  
    res.end('PUT operation not supported on /dishes');
})

.delete((req,res,next) =>{
    res.end('Deleting all the dishes!');
});
dishRouter.route('/:dishId')
.get((req,res,next) =>{
    res.end('Well send details of the dish: '+req.params.dishId+" to you!");//params-parameters
})

.post((req,res,next) =>{
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+req.params.dishId);//extracting name and description for the body
})

.put((req,res,next) =>{
    res.write('Updating the dish: ' + req.params.dishId+'\n');
    res.end('Will update the dish: '+req.body.name+' with details '+req.body.description);
})

.delete((req,res,next) =>{
    res.end('Deleting dish: '+req.params.dishId);
});


module.exports = dishRouter;//exports everything