const express = require('express');
const router = express.Router();
const path = require('path'); // ✅ المهم ده
const multer = require('multer');
const appointmentController = require('../controllers/appointmentsController');

// إعداد رفع الملفات
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// مسار الحجز
router.post('/book', upload.single('attachment'), appointmentController.bookAppointment);

module.exports = router;
