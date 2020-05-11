require('./db/mongoose');
const userRoutes = require('../src/routers/users');
const taskRoutes = require('../src/routers/tasks');
const port = process.env.PORT;
const express = require('express');
const app = express();

app.use(express.json());

app.use(userRoutes);
app.use(taskRoutes);

app.listen(port, () => {
    console.log(`Connected on Port ${port}`);
});
