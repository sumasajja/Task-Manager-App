const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        lowercase: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Needs to be in email format');
            }
        }
    },
    password: {
        type: String,
        trim: true,
        minlength: 6,
        validate(value) {
            if (validator.contains(value, 'password')) {
                throw new Error('Should not contain text password');
            }
        }
    },
    age: {
        type: Number,
        default: 10,
        validate(value) {
            if (value < 0)
                throw new Error('Age should be greater than 1')
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.methods.getAuthToken =  async function() {
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.SECRET);
    console.log(token);
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

userSchema.methods.toJSON = function() {
    const user = this;
    console.log(`user- ${user}`);
    const userObj = user.toObject();
    console.log(`Object user - ${userObj}`);
    delete userObj.password;
    delete userObj.tokens;
    delete userObj.avatar;
    return userObj;
}

userSchema.statics.findByCredentials =  async(email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error({'error': 'User login invalid'});
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error({'error': 'Login invalid'});
    }
    return user;
}

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password'))  {
        user.password  = await bcrypt.hash(user.password, 8);
    }
    console.log('Just before saving!');  
    next();
});

//delete user tasks when user is  deleted 
userSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany({owner: user._id});
    console.log('deleted tasks')
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;