const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true 
    },
    password: {
        type: String,
        required: true
    },
    college: {  
        type: String,
        required: false
    },
    branch: {  
        type: String,
        // required: false
    },
    cgpa : {
        type: String,
    },
    skills : {  
        type: String
    },
    interests : {
        type : String
    },
    achievements : {
        type : String
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
