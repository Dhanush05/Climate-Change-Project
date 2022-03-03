const oracledb = require('oracledb');
try {
  oracledb.initOracleClient({libDir: 'D:\\instantclient_21_3'});
} catch (err) {
  console.error('Connection Fail!');
  console.error(err);
  process.exit(1);
}
//////take input from front end

let year1=1900;
let year2 = 2000;
let period = 10;
let count = (year2-year1)/period;
let t=[];
async function establishConnection() {
  try {
    connection = await oracledb.getConnection({
      username      : "dpakanati",
      password      : "hy4XnKOEhiCRlK8yCQrrOZah",
      connectString : "oracle.cise.ufl.edu:1521/orcl"
    });
    //console.log(connection);
    let tempyear = year1;
    while (tempyear<year2){
      
       tempyear = year1+10;
       result1 = await connection.execute(`
      select * from (select count(disaster_id) as dis1 from (
      select ltrim(TO_CHAR(disaster_date, 'mm-yyyy'),0) as mmdd, state, disaster_id, year, type 
      from disasters_usa where type = 'Hurricane' 
      and extract(year from disaster_date) between ${year1} and ${tempyear})),
      (select count(disaster_id) as dis2 from (
      select ltrim(TO_CHAR(disaster_date, 'mm-yyyy'),0) as mmdd, state, disaster_id, year, type 
      from disasters_usa where type = 'Flo  od' 
      and extract(year from disaster_date) between ${year1} and ${tempyear}))
        `);
        result1.metaData.push({
             Timeperiod: year1+'-'+tempyear,
             numberOfPeriods: count
        });
        t.push(result1);
       // console.log(JSON.stringify(result1));
       year1= tempyear;
    }
    console.log(JSON.stringify(t))
    

  } catch (err) {
    console.error(err.message);
  } finally {
    return connection;
  }
}

connection = establishConnection();

module.exports = {connection}