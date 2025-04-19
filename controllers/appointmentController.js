const path = require('path');
const oracledb = require('oracledb');
const multer = require('multer');
const db = require('../config/database');

// إعداد رفع الملفات
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

const handleAppointment = async (req, res) => {
    try {
        const {
            appointmentFor,
            dependentName,
            hasInsurance,
            reason,
            symptoms,
            consultationType // ✅ النوع الجديد
        } = req.body;

        const file = req.file;

        const conn = await db();

        await conn.execute(`
            INSERT INTO patient_appointments (
                patient_id,
                appointment_for,
                dependent_name,
                has_insurance,
                reason,
                symptoms,
                uploaded_file,
                consultation_type
            ) VALUES (
                :patient_id,
                :appointment_for,
                :dependent_name,
                :has_insurance,
                :reason,
                :symptoms,
                :uploaded_file,
                :consultation_type
            )
        `, {
            patient_id: req.user.id, // من JWT
            appointment_for: appointmentFor,
            dependent_name: dependentName,
            has_insurance: hasInsurance,
            reason,
            symptoms,
            uploaded_file: file?.filename || null,
            consultation_type: consultationType
        }, { autoCommit: true });

        res.status(200).json({
            message: '✅ Appointment saved to DB!',
            data: {
                appointmentFor,
                dependentName,
                hasInsurance,
                reason,
                symptoms,
                consultationType,
                uploadedFile: file?.filename || null
            }
        });

    } catch (err) {
        console.error("❌ Error saving appointment:", err.message);
        res.status(500).json({ message: '❌ Failed to save appointment', error: err.message });
    }
};

module.exports = { handleAppointment, upload };
