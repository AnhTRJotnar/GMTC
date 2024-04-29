var express = require('express');
var router = express.Router();
var UserModel = require('../models/UserModel');
var bcrypt = require('bcryptjs');
//var { hash } = require('bcrypt');
var salt = 8; 

router.get('/login', (req, res) => {
    res.render('auth/login', {layout: 'loginLayout'})
})

router.post('/login', async (req, res) => {
    try {
        const userLogin = req.body;
        const user = await UserModel.findOne({ username: userLogin.username });
        if (!user) {
            return res.status(401).render('auth/login', {
            error: 'Invalid username or password',
            layout: 'loginLayout'
            });
        }
        const isPasswordCorrect = bcrypt.compareSync(userLogin.password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).render('auth/login', {
            error: 'Invalid username or password', 
            layout: 'loginLayout'
            });
        }
        req.session.userId = user._id.toString();
        req.session.username = user.username;
        req.session.role = user.role;
        console.log(req.session.userId)
        if (req.session.role === 'admin') {
            return res.redirect('/admin');
        } else {
            return res.redirect('/');
        }

        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).send('An error occurred during login. Please try again later.');
        }
    });

router.get('/logout', (req, res) =>{
    req.session.destroy();
    res.redirect('/auth/login');
})

module.exports = router;
