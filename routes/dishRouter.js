const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose-currency');
const authenticate = require('../authenticate');

const Dishes = require('../models/dishes');

const dishRouter = express.Router();
dishRouter.use(bodyParser.json());
dishRouter.route('/')//we declare end point at one location
.get((req,res,next) =>{
    Dishes.find({})
    .populate('comments.author')
    .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dishes);
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req,res,next) =>{//checks whether user is authenticated or not
  Dishes.create(req.body)
  .then((dish)=>{
      console.log("Dish Created ",dish);
      res.statusCode = 200;
      res.setHeader('Content-Type','application/json');
      res.json(dish);
  },(err) => next(err))
  .catch((err) => next(err));
})
.put(authenticate.verifyUser,(req,res,next) =>{
    res.statusCode = 403;//not supported  
    res.end('PUT operation not supported on /dishes');
})

.delete(authenticate.verifyUser,(req,res,next) =>{
   Dishes.remove({})
   .then((resp) => {
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json(resp);
   },(err) => next(err))
   .catch((err) => next(err));
});
dishRouter.route('/:dishId')
.get((req,res,next) =>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    },(err) => next(err))
    .catch((err) => next(err));
})

.post(authenticate.verifyUser,(req,res,next) =>{
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+req.params.dishId);//extracting name and description for the body
})

.put(authenticate.verifyUser,(req,res,next) =>{
    Dishes.findByIdAndUpdate(req.params.dishId,{
        $set:req.body
    },{new:true})
    .then((dish)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    },(err) => next(err))
    .catch((err) => next(err));
})

.delete(authenticate.verifyUser,(req,res,next) =>{
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
       },(err) => next(err))
       .catch((err) => next(err));
    
});
/**/
dishRouter.route('/:dishId/comments')
.get((req,res,next) =>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish) => {
        if(dish != null){
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(dish.comments);
        }
        else{
            err = new Error('Dish '+req.params.dishId+' not Found');
            err.statusCode = 400;
            return next(err);
        }
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser,(req,res,next) =>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish != null){
            req.body.author = req.user._id;//as author field stores the object id
            dish.comments.push(req.body);//as body of request contains comments
            dish.save()
            .then((dish) => {
                Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish)=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        res.json(dish);  
                    })
                  
            },(err)=> next(err));
        }
        else{
            err = new Error('Dish '+req.params.dishId+' not Found');
            err.statusCode = 400;
            return next(err);
        }
  },(err) => next(err))
  .catch((err) => next(err));
})
.put(authenticate.verifyUser,(req,res,next) =>{
    res.statusCode = 403;//not supported  
    res.end('PUT operation not supported on /dishes/'+req.params.dishId+'/comments');
})

.delete(authenticate.verifyUser,(req,res,next) =>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish != null){
           for (var i= (dish.comments.length-1);i>=0;i--){//as comments are sub documents we need to iterate through comments
               dish.comments.id(dish.comments[i]._id).remove();
           }
           dish.save()
           .then((dish)=>{
            Dishes.findById(dish._id)
                .populate('comments.author')
                .then((dish)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type','application/json');
                    res.json(dish);  
                })  
           },(err) => next(err));
        }

        else{
            err = new Error('Dish '+req.params.dishId+' not Found');
            err.statusCode = 400;
            return next(err);
        }
   },(err) => next(err))
   .catch((err) => next(err));
});
dishRouter.route('/:dishId/comments/:commentId')
.get((req,res,next) =>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish)=>{
        if(dish != null && dish.comments.id(req.params.commentId)!=null){
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(dish.comments.id(req.params.commentId));
        }
        else if(dish == null){
            err = new Error('Dish '+req.params.dishId+' not Found');
            err.statusCode = 400;
            return next(err);
        }
        else{
            err = new Error('comment '+req.params.commentId+' not Found');
            err.statusCode = 400;
            return next(err);
        }
    },(err) => next(err))
    .catch((err) => next(err));
})

.post(authenticate.verifyUser,(req,res,next) =>{
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/'+req.params.dishId+'/comments/'+req.params.commentId);//extracting name and description for the body
})

.put(authenticate.verifyUser,(req,res,next) =>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish != null && dish.comments.id(req.params.commentId)!=null){//dish and comment exists
            //easy way update a sub document as their is no explict way through mongoDB
            if(req.body.rating){
                dish.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if(req.body.comment){
                dish.comments.id(req.params.commentId).comment = req.body.comment;
            }
            dish.save()
            .then((dish)=> {
                Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish)=>{
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        res.json(dish);    
                    })
            },(err)=> next(err));
        }
        else if(dish == null){
            err = new Error('Dish '+req.params.dishId+' not Found');
            err.statusCode = 400;
            return next(err);
        }
        else{
            err = new Error('comment '+req.params.commentId+' not Found');
            err.statusCode = 400;
            return next(err);
        }
    },(err) => next(err))
    .catch((err) => next(err));
})

.delete(authenticate.verifyUser,(req,res,next) =>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish != null && dish.comments.id(req.params.commentId)!=null){//dish and comment exists
            dish.comments.id(req.params.commentId).remove();
            dish.save()
            .then((dish)=>{
               res.statusCode = 200;
               res.setHeader('Content-Type','application/json');
               res.json(dish);
            },(err) => next(err));
        }
        else if(dish == null){
            err = new Error('Dish '+req.params.dishId+' not Found');
            err.statusCode = 400;
            return next(err);
        }
        else{
            err = new Error('comment '+req.params.commentId+' not Found');
            err.statusCode = 400;
            return next(err);
        }
   },(err) => next(err))
   .catch((err) => next(err));
    
});


module.exports = dishRouter;//exports everything