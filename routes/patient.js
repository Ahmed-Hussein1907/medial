const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');
const getConnection = require('../config/database');

// ✅ عرض رسالة ترحيب للمريض
router.get('/profile', verifyToken, authorizeRoles('patient'), (req, res) => {
    res.json({ message: `👋 Welcome Patient ${req.user.name}` });
});

// ✅ استرجاع كل المرضى - مسموح لـ doctor و admin
router.get('/all', verifyToken, authorizeRoles('doctor', 'admin'), async (req, res) => {
    try {
        const conn = await getConnection();
        const result = await conn.execute(
            `SELECT id, name, email FROM users WHERE role = 'patient'`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.status(200).json({ patients: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ✅ استرجاع آخر vital signs لمريض معين
router.get('/:id/vitals', verifyToken, authorizeRoles('doctor', 'patient', 'admin'), async (req, res) => {
    const patientId = req.params.id;
    try {
        const conn = await getConnection();
        const result = await conn.execute(
            `SELECT 
                id, patient_id, heart_rate, body_temp,
                glucose_level_min, glucose_level_max,
                spo2, blood_pressure, bmi, report_date
             FROM vital_signs 
             WHERE patient_id = :id 
             ORDER BY report_date DESC 
             FETCH FIRST 1 ROWS ONLY`,
            [patientId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json({ vitals: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching vitals' });
    }
});

// ✅ إدخال بيانات vitals جديدة
router.post('/:id/vitals', verifyToken, authorizeRoles('doctor', 'admin'), async (req, res) => {
    const patientId = req.params.id;
    const {
        heart_rate, body_temp, glucose_level_min,
        glucose_level_max, spo2, blood_pressure, bmi
    } = req.body;

    try {
        const conn = await getConnection();
        await conn.execute(
            `INSERT INTO vital_signs 
             (patient_id, heart_rate, body_temp, glucose_level_min, glucose_level_max, spo2, blood_pressure, bmi, report_date)
             VALUES (:patientId, :hr, :bt, :gmin, :gmax, :spo2, :bp, :bmi, SYSDATE)`,
            {
                patientId,
                hr: heart_rate,
                bt: body_temp,
                gmin: glucose_level_min,
                gmax: glucose_level_max,
                spo2,
                bp: blood_pressure,
                bmi
            },
            { autoCommit: true }
        );
        res.json({ message: 'Vital signs recorded' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error recording vitals' });
    }
});

// ✅ استرجاع كل التقارير الطبية
router.get('/:id/reports', verifyToken, authorizeRoles('doctor', 'patient', 'admin'), async (req, res) => {
    const patientId = req.params.id;
    try {
        const conn = await getConnection();
        const result = await conn.execute(
            `SELECT * FROM medical_reports WHERE patient_id = :id ORDER BY report_date DESC`,
            [patientId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json({ reports: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching reports' });
    }
});

// ✅ إضافة تقرير طبي جديد (يتم التعامل مع null عند عدم وجود comment)
router.post('/:id/reports', verifyToken, authorizeRoles('doctor', 'admin'), async (req, res) => {
    const patientId = req.params.id;
    const { report_name, report_type, comment } = req.body;

    try {
        const conn = await getConnection();
        await conn.execute(
            `INSERT INTO medical_reports 
             (patient_id, report_name, report_type, report_comment, report_date)
             VALUES (:patientId, :r_name, :r_type, :r_comment, SYSDATE)`,
            {
                patientId,
                r_name: report_name,
                r_type: report_type,
                r_comment: comment && comment.trim() !== "" ? comment : null
            },
            { autoCommit: true }
        );
        res.json({ message: 'Report added successfully ✅' });
    } catch (error) {
        console.error("Add report error:", error);
        res.status(500).json({ message: '❌ فشل في إضافة التقرير', error: error.message });
    }
});

// ✅ تعديل تقرير طبي معين
router.put('/report/:reportId', verifyToken, authorizeRoles('doctor', 'admin'), async (req, res) => {
    const reportId = req.params.reportId;
    const { report_name, report_type, comment } = req.body;
    try {
        const conn = await getConnection();
        await conn.execute(
            `UPDATE medical_reports 
             SET report_name = :r_name, report_type = :r_type, report_comment = :r_comment
             WHERE id = :id`,
            {
                r_name: report_name,
                r_type: report_type,
                r_comment: comment && comment.trim() !== "" ? comment : null,
                id: reportId
            },
            { autoCommit: true }
        );
        res.json({ message: 'Report updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating report' });
    }
});

// ✅ حذف تقرير طبي معين
router.delete('/report/:reportId', verifyToken, authorizeRoles('doctor', 'admin'), async (req, res) => {
    const reportId = req.params.reportId;
    try {
        const conn = await getConnection();
        await conn.execute(
            `DELETE FROM medical_reports WHERE id = :id`,
            [reportId],
            { autoCommit: true }
        );
        res.json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting report' });
    }
});

module.exports = router;
