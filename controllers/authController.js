const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const oracledb = require('oracledb');
const getConnection = require('../config/database');

const secretKey = "secret-medial-key";

// ✅ Register
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const conn = await getConnection();
    const check = await conn.execute(
      `SELECT * FROM USERS WHERE EMAIL = :email`,
      [email]
    );
    if (check.rows.length > 0)
      return res.status(400).json({ message: "❌ Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await conn.execute(
      `INSERT INTO USERS (NAME, EMAIL, PASSWORD, ROLE) VALUES (:name, :email, :password, :role)`,
      [name, email, hashedPassword, role],
      { autoCommit: true }
    );

    res.status(201).json({ message: "✅ Registered successfully" });
  } catch (err) {
    console.error("❌ Register Error:", err.message);
    res.status(500).json({ message: "❌ Server Error", error: err.message });
  }
};

// ✅ Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT * FROM USERS WHERE EMAIL = :email`,
      [email],
      { outFormat: oracledb.OUT_FORMAT_OBJECT } // ✅ عشان يرجع object مش array
    );

    if (result.rows.length === 0)
      return res.status(401).json({ message: "❌ Email not found" });

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.PASSWORD);
    if (!isMatch)
      return res.status(401).json({ message: "❌ Incorrect password" });

    const token = jwt.sign(
      {
        id: user.ID,
        name: user.NAME,
        email: user.EMAIL,
        role: user.ROLE
      },
      secretKey,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({ message: "❌ Server Error", error: err.message });
  }
};

// ✅ Change Password with Email and Old Password
exports.changePasswordWithEmail = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT PASSWORD FROM USERS WHERE ID = :id AND EMAIL = :email`,
      { id: userId, email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "❌ User not found or email mismatch" });

    const isMatch = await bcrypt.compare(oldPassword, result.rows[0].PASSWORD);
    if (!isMatch)
      return res.status(400).json({ message: "❌ Old password is incorrect" });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await conn.execute(
      `UPDATE USERS SET PASSWORD = :password WHERE ID = :id`,
      { password: hashedNewPassword, id: userId },
      { autoCommit: true }
    );

    res.status(200).json({ message: "✅ Password changed successfully" });
  } catch (err) {
    console.error("❌ Change Password Error:", err.message);
    res.status(500).json({ message: "❌ Server Error", error: err.message });
  }
};

// ✅ Logout
exports.logout = async (req, res) => {
  try {
    // ممكن تخزن التوكن في Blacklist هنا لو حبيت
    res.status(200).json({ message: "✅ Logged out successfully" });
  } catch (err) {
    console.error("❌ Logout Error:", err.message);
    res.status(500).json({ message: "❌ Server Error", error: err.message });
  }
};
