// const oracledb = require('oracledb');

// run();

// async function run() {
//     try {
//         console.log('yes');
//         let connection = await oracledb.getConnection( {
//             user          : "ganeshsundar",
//             password      : "venkat007",
//             connectString : "oracle.cise.ufl.edu:1521/orcl"
//           });
//           const result = await connection.execute(
//             `show databases`
//           );
//           console.log('succes');
//     } catch (err) {
//         console.log(err);
//     }
// }

const oracledb = require('oracledb');

try {
  oracledb.initOracleClient({libDir: '/opt/oracle/instantclient_21_4'});
} catch (err) {
  console.error('Connection Fail!');
  console.error(err);
  process.exit(1);
}

async function establishConnection() {
  try {
    connection = await oracledb.getConnection({
      username      : "dpakanati",
      password      : "hy4XnKOEhiCRlK8yCQrrOZah",
      connectString : "oracle.cise.ufl.edu:1521/orcl"
    });

    result = await connection.execute(`select t1.sum as landtemp, t1.year,t2.area from (select sum(landavgtemp) as sum, extract(year from temp_date) as year 
    from (select * from global_temperatures where extract(year from temp_date) between 1980 and 2000)
    group by extract(year from temp_date) 
    order by extract(year from temp_date)) t1,(select m_year, area from melting_ice) t2
    where t1.year = t2.m_year`);

    return connection;
  } catch (err) {
    console.error(err.message);
  } finally {
    return connection;
    /*
    if (connection) {
      try {
        await connection.close();   // Always close connections
      } catch (err) {
        console.error(err.message);
      }
    }
    */
  }
}

connection = establishConnection();

module.exports = {connection}