const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth');
const doctorController = require('../controllers/doctorController');

// Get all doctors
router.get('/doctors', verifyToken, doctorController.getAllDoctors);

// Add new doctor
router.post('/doctors', verifyToken, authorizeRoles('admin'), doctorController.addDoctor);

// Delete doctor by ID
router.delete('/doctors/:id', verifyToken, authorizeRoles('admin'), doctorController.deleteDoctor);

module.exports = router;
