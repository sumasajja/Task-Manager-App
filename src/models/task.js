const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    completed: { type: Boolean, required: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }
    }, { timestamps: true });

taskSchema.pre('save', async function (next) {
    const task = this;
    console.log('Before calling save!');
    next();
})

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;