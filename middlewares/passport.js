require("dotenv").config();
console.log("GOOGLE_CLIENT_ID =", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET =", process.env.GOOGLE_CLIENT_SECRET);
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const secretKey = "secret-medial-key";


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    const name = profile.displayName;

    // تقدر تسجل المستخدم هنا في DB لو عايز
    const user = {
        id: profile.id,
        name,
        email,
        role: "google"
    };

    const token = jwt.sign(user, secretKey, { expiresIn: "1h" });
    user.token = token;
    done(null, user);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;