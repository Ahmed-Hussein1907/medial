const getConnection = require('../config/database');

const DoctorController = {
    getAllDoctors: async (req, res) => {
        try {
            const conn = await getConnection();
            const result = await conn.execute('SELECT * FROM DOCTORS');
            await conn.close();
            res.json(result.rows);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching doctors', error: err });
        }
    },

    addDoctor: async (req, res) => {
        const {
            name, specialty, address,
            appointment_time, appointment_type,
            service_name, service_duration,
            image_url
        } = req.body;

        try {
            const conn = await getConnection();
            await conn.execute(`
                INSERT INTO DOCTORS 
                (NAME, SPECIALTY, ADDRESS, APPOINTMENT_TIME, APPOINTMENT_TYPE, SERVICE_NAME, SERVICE_DURATION, IMAGE_URL)
                VALUES (:name, :specialty, :address, :appointment_time, :appointment_type, :service_name, :service_duration, :image_url)
            `, {
                name, specialty, address,
                appointment_time, appointment_type,
                service_name, service_duration,
                image_url
            }, { autoCommit: true });

            await conn.close();
            res.json({ message: 'Doctor added successfully' });

        } catch (err) {
            res.status(500).json({ message: 'Error adding doctor', error: err.message });
        }
    },

    deleteDoctor: async (req, res) => {
        const { id } = req.params;
        try {
            const conn = await getConnection();
            await conn.execute('DELETE FROM DOCTORS WHERE ID = :id', { id }, { autoCommit: true });
            await conn.close();
            res.json({ message: 'Doctor deleted successfully' });
        } catch (err) {
            res.status(500).json({ message: 'Error deleting doctor', error: err });
        }
    }
};

module.exports = DoctorController;