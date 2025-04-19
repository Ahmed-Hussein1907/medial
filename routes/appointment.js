const express = require('express');
const router = express.Router();
const { handleAppointment, upload } = require('../controllers/appointmentController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

// السماح للمريض فقط بإنشاء موعد
router.post('/', verifyToken, authorizeRoles('patient'), upload.single('attachment'), handleAppointment);

module.exports = router;
