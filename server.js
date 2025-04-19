require("dotenv").config(); // 🟢 أول سطر دايمًا

const express = require('express');
const path = require('path');
const session = require("express-session");

const app = express();

// ✅ حمّل الاتصال قبل الـ passport
const getConnection = require('./config/database');

// ✅ استيراد الراوتات قبل passport
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctor');
const patientRoutes = require('./routes/patient');
const appointmentRoutes = require('./routes/appointment');
const appointmentsRoutes = require('./routes/appointments');



// ✅ استيراد passport بعد تحميل dotenv وكل الراوتات
const passport = require("./middlewares/passport");

// 📁 إعدادات الميدل وير
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({ secret: "google-auth", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
// ✅ تسجيل الراوتات
app.use('/api/auth', authRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/appointments', appointmentsRoutes);

// ✅ الاتصال بقاعدة البيانات
getConnection()
    .then(() => console.log("✅ Connected to Oracle DB!"))
    .catch(err => console.error("❌ Failed to connect to DB:", err.message));

// ✅ تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
