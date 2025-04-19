const path = require('path');
const oracledb = require('oracledb');
const db = require('../config/database');

const bookAppointment = async (req, res) => {
    try {
        // استخدام FormData لجلب البيانات
        const {
            specialty,
            service,
            appointmentType,
            clinic,
            date,
            time,
            firstName,
            lastName,
            phone,
            email,
            symptoms,
            reason,
            paymentMethod,
            total
        } = req.body;

        const uploadedFile = req.file ? req.file.filename : null;
        const userId = 81; // لاحقًا من JWT أو session
        const parsedTotal = total && !isNaN(Number(total)) ? Number(total) : 0;

        const conn = await db();

        await conn.execute(`
            INSERT INTO PATIENT_APPOINTMENTS_BOOK (
                PATIENT_ID,
                APPOINTMENT_FOR,
                DEP_NAME,
                HAS_INSURANCE,
                REASON,
                SYMPTOMS,
                UPLOADED_FILE,
                CONSULT_TYPE,
                CLINIC_NAME,
                APPOINTMENT_DATE,
                APPOINTMENT_TIME,
                PAYMENT_METHOD,
                TOTAL_AMOUNT,
                FIRST_NAME,
                LAST_NAME,
                PHONE,
                EMAIL,
                SERVICE_NAME
            ) VALUES (
                :patient_id,
                :appointment_for,
                :dep_name,
                :has_insurance,
                :reason,
                :symptoms,
                :uploaded_file,
                :consult_type,
                :clinic,
                TO_DATE(:appointment_date, 'YYYY-MM-DD'),
                :appointment_time,
                :payment_method,
                :total_amount,
                :first_name,
                :last_name,
                :phone,
                :email,
                :service_name
            )
        `, {
            patient_id: userId,
            appointment_for: 'Myself',
            dep_name: specialty,
            has_insurance: 'Yes',
            reason,
            symptoms,
            uploaded_file: uploadedFile,
            consult_type: appointmentType,
            clinic,
            appointment_date: date,
            appointment_time: time,
            payment_method: paymentMethod,
            total_amount: parsedTotal,
            first_name: firstName,
            last_name: lastName,
            phone,
            email,
            service_name: service
        }, { autoCommit: true });

        res.status(200).json({ message: "✅ Appointment saved successfully." });

    } catch (err) {
        console.error("❌ Error saving appointment:", err.message);
        res.status(500).json({
            message: '❌ Failed to save appointment',
            error: err.message
        });
    }
};

module.exports = { bookAppointment };
