const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

router.post('/tasks', auth, async (req, res, next) => {
    const task = new Task({ ...req.body, owner: req.user._id });
    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(404).res.send(e);
    }
});

router.get('/tasks', auth, async (req, res, next) => {
    try {
        const match = {};
        const sort = {};
        if (req.query.sortBy) {
            const queryString = req.query.sortBy;
            const sortByField = queryString.split(':')[0];
            const sortByAscOrDesc = queryString.split(':')[1];
            if (sortByAscOrDesc) {
                sortByAscOrDesc === 'asc' ? 
                (sort[sortByField] = 1) : sortByAscOrDesc === 'desc' ? 
                (sort[sortByField] = -1): (sort[sortByField] = 1);
            }
            console.log(sort);
        }
        if (req.query.completed) {
            match.completed = (req.query.completed === 'true');
        }
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/tasks/:id', auth, async (req, res, next) => {
    try {
        const _id = req.params.id;
        const task = await Task.findOne({ _id, owner: req.user._id });
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/tasks/:id', auth, async (req, res, next) => {
    const validTaskkeys = ['completed', 'description'];
    const keysToBeUpdated = Object.keys(req.body);
    const isValidUpdate = keysToBeUpdated.every(item => validTaskkeys.includes(item));
    try {
        // const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        await req.user.populate('tasks').execPopulate();
        const task = req.user.tasks.findOne({ _id: req.params.id });
        keysToBeUpdated.forEach((keyItem) => req.user.task[keyItem] = req.body[keyItem]);
        if (!isValidUpdate) {
            return res.status(400).send({ 'error': 'invalid keys' });
        }
        await task.save();
        console.log(task);
        if (!task) {
            return res.status(404).send({ 'error': 'user not found' });
        }
        // const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true });
        res.status(201).send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.delete('/tasks/:id', auth, async (req, res, next) => {
    try {
        const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!deletedTask) {
            return res.status(404).send({ 'error': 'Task not found' });
        }
        res.status(200).send(deletedTask);
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;