const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');
const router = require("express").Router();
const passport = require("../middlewares/passport");

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/change-password-with-email', verifyToken, authController.changePasswordWithEmail);
router.post('/logout', verifyToken, authController.logout);
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/" }),
    (req, res) => {
        // رجّع المستخدم للواجهة مع التوكن
        res.redirect(`http://localhost:3000/auth.html?token=${req.user.token}`);


    }
);

module.exports = router;
