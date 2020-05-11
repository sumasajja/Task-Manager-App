const express = require('express');
const sharp = require('sharp');
const router = express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { sendWelcomeEmail, sendGoodByeEmail }  = require('../emails/account');

router.post('/users', async (req, res, next) => {
    console.log(req.body);
    const user = new User(req.body);
    try {
        await user.save();
        sendWelcomeEmail(user.name, user.email);
        const token = await user.getAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

router.post('/users/login', async (req, res, next) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.getAuthToken();
        res.send({ user: user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get('/users/me', auth, async (req, res, next) => {
    res.send(req.user);
});

router.post('/users/logout', auth, async (req, res, next) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.send();
    }
    catch (e) {
        res.status(500).send(e);
    }
});

router.post('/users/logoutAll', auth, async (req, res, next) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/users/me', auth, async (req, res) => {
    const changes = Object.keys(req.body);
    const validUpdates = ['name', 'email', 'password', 'age'];
    const validUpdate = changes.every(item => validUpdates.includes(item));
    try {
        changes.forEach((change) => req.user[change] = req.body[change]);
        if (!validUpdate) {
            return res.status(400).send({ 'error': 'invalid updates' });
        }
        await req.user.save();
        res.status(201).send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.delete('/users/me', auth, async (req, res, next) => {
    try {
        await req.user.remove();
        sendGoodByeEmail(req.user.name, req.user.email);
        res.send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res, next) => {
    try {
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();
        req.user.avatar = buffer;
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});


router.delete('/users/me/avatar', auth, upload.single('avatar'), async (req, res, next) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e);
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

router.get('/users/:id/avatar', async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error();
        }
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send(e);
    }
});

module.exports = router;