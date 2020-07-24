var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    firstname:{
        type:String,
        default:''
    },
    lastname:{
        type:String,
        default:''
    },
    //username and password will be automatically added by mongoose plugin
    admin:   {
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose);//for username and password


module.exports = mongoose.model('User', User);