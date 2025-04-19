const oracledb = require('oracledb');

async function getConnection() {
  return await oracledb.getConnection({
    user: "system",
    password: "sha3ra2832002",  // ← حط الباسورد بتاعك هنا
    connectString: "localhost:1521/XE"
  });
}

module.exports = getConnection;
