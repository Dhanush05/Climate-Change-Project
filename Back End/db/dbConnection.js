const oracledb = require('oracledb');

try {
    oracledb.initOracleClient({ libDir: '/opt/oracle/instantclient_21_4' });
} catch (err) {
    console.error('Connection Fail!');
    console.error(err);
    process.exit(1);
}

module.exports = (async function establishConnection() {
    try {
        connection = await oracledb.getConnection({
            username: "dpakanati",
            password: "hy4XnKOEhiCRlK8yCQrrOZah",
            connectString: "oracle.cise.ufl.edu:1521/orcl"
        });
    } catch (err) {
        console.error(err.message);
    } finally {
        return connection;
    }
})();
