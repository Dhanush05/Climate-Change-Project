const express = require('express');
const router = express.Router();
const cors = require('cors');
// const { connection } = require('../../../Downloads/connect (1) (2).js');
var db;

(async function getDB() {
    db = await require('../db/dbConnection.js');
    console.log('Connected to the DB');
})();

function getPrefixedDate(dateString) {
    let day = dateString.split('-')[0];
    day = day + '-'
    console.log(dateString.replace(day, '01-'));
    return dateString.replace(day, '01-');
}

router.get('/', cors(), (req, res) => {
    res.send('Welcome to the Climate change Awareness App!');
});

router.post('/natural-disasters/melting-ice', cors(), async function (req, res) {
    try {
        const startYear = req.body.startYear;
        const endYear = req.body.endYear;

        const result = await db.execute(`select t1.sum as landtemp, t1.year,t2.area from (select sum(landavgtemp) as sum, extract(year from temp_date) as year 
        from (select * from global_temperatures where extract(year from temp_date) between ${startYear} and ${endYear})
        group by extract(year from temp_date) 
        order by extract(year from temp_date)) t1,(select m_year, area from melting_ice) t2
        where t1.year = t2.m_year`);

        res.status(201).json(result);
    } catch (err) {
        res.status(409).json(err.toString());
    }
});

router.post('/surface-temperatures/countries', cors(), async function (req, res) {
    try {
        const startYear = getPrefixedDate(req.body.startYear);
        const endYear = getPrefixedDate(req.body.endYear);

        console.log('Start year', startYear);
        console.log('End year', endYear);
        console.log(typeof startYear);

        const limit = '3';

        const result = await db.execute(`select extract(year from temp_date) as year, avg(avgtemp),country from (
            select temp_date,avgtemp,avgtempuncertainity,country from country_temperatures 
            where country in (select country from (
            select country,diff,my_rank,year1,year2 from (
            SELECT ((T2.AVGTEMP - T1.AVGTEMP)*100/(T1.AVGTEMP+1)) AS DIFF, t1.year1,t2.year2,
            T1.COUNTRY, RANK() over (order by (T2.AVGTEMP - T1.AVGTEMP)/(T1.AVGTEMP+1) desc) my_rank 
            FROM (select avgtemp,country, extract(year from temp_date) as year1 from country_temperatures where temp_date = '${startYear}') T1,
            (select avgtemp,country, extract(year from temp_date) as year2 from country_temperatures where temp_date = '${endYear}')  T2
            where t1.country = t2.country)
            where my_rank<${limit}+1)  
            )) 
            group by extract(year from temp_date),country
            having extract(year from temp_date) between extract(year from TO_DATE('${startYear}','DD-Mon-YYYY')) and 
            extract(year from TO_DATE('${endYear}','DD-Mon-YYYY')) 
            order by extract(year from temp_date)`);

        console.log('Res', result);

        res.status(201).json(result);
    } catch (err) {
        console.log(err);
        res.status(409).json(err.toString());
    }
});

router.post('/surface-temperatures/regions', cors(), async function (req, res) {
    try {
        let latA1 = req.body.latA1;
        let latA2 = req.body.latA2;
        // let latB1 = req.body.latB1;
        // let latB2 = req.body.latB2;
        let startYear = req.body.startYear;
        let endYear = req.body.endYear;

        let result = await db.execute(`select sum(avgtemp)/count(avgtemp) as Average, extract(year from temp_date) as years from country_temperatures 
        where country in (
        select name from country_details where latitudes>${latA1}
        intersect 
        select name from country_details where latitudes<${latA2})
        group by extract(year from temp_date)
        having extract(year from temp_date)>${startYear} and extract(year from temp_date)<${endYear}
        order by years`);

        console.log('r1', req.body.r1);
        console.log('result', result);
        console.log('res metaData', result.metaData);
        console.log('res metaData 2', result.metaData[2]);

        if (req.body.r1) {
            console.log('Inside here');
            result.metaData.push({
                Region: 'Region - 1'
            })
            console.log('Updated res metadata', result.metaData);
            console.log('Updated result', result);
            console.log('*******************8');
        } else {
            result.metaData.push({
                Region: 'Region - 2'
            })
        }

        res.status(201).json(result);
    } catch (err) {
        res.status(409).json(err.toString());
    }
});

router.post('/co2-emissions/temperature-change', cors(), async function (req, res) {
    try {
        const startYear = req.body.startYear;
        const endYear = req.body.endYear;

        const result = await db.execute(`select t1.year,t1.total,t2.lowincome,t3.highincome from 
        (select year, sum(value) as total from co2emissions where year between ${startYear} and ${endYear} group by year) t1,
        (select year, sum(value) as lowincome from co2emissions where year between ${startYear} and ${endYear} and 
        country_code in (select code from country_details
        where incomegroup in 'Low income' or incomegroup = 'Low middle Income' or incomegroup = 'Upper middle income' or incomegroup is null)
        group by year) t2,
        (select  year, sum(value)as Highincome from co2emissions where year between ${startYear} and ${endYear} and country_code in (select code from country_details
        where incomegroup='High income')  group by year) t3
        where t1.year = t2.year and t2.year = t3.year order by year`);

        res.status(201).json(result);
    } catch (err) {
        res.status(409).json(err.toString());
    }
});

router.post('/natural-disasters/frequency', cors(), async function (req, res) {
    try {
        let startYear = req.body.startYear;
        let endYear = req.body.endYear;
        let period = 10;
        let count = (endYear - startYear) / period;
        let result = [];
        let disaster1 = req.body.disaster1;
        let disaster2 = req.body.disaster2;

        let tempyear = startYear;
        while (tempyear < endYear) {

            tempyear = startYear + 10;
            result1 = await connection.execute(`
            select * from (select count(disaster_id) as ${disaster1} from (
                select ltrim(TO_CHAR(disaster_date, 'mm-yyyy'),0) as mmdd, state, disaster_id, year, type 
                from disasters_usa where type = '${disaster1}'
                and extract(year from disaster_date) between ${startYear} and ${tempyear})),
                (select count(disaster_id) as ${disaster2} from (
                select ltrim(TO_CHAR(disaster_date, 'mm-yyyy'),0) as mmdd, state, disaster_id, year, type 
                from disasters_usa where type = '${disaster2}'
                and extract(year from disaster_date) between ${startYear} and ${tempyear})),
                (select avg(avgtemp) as SurfaceTemp from country_temperatures where extract(year from temp_date) between ${startYear} and ${tempyear})
        `);
            result1.metaData.push({
                Timeperiod: startYear + '-' + tempyear,
                numberOfPeriods: count
            });
            result.push(result1);
            // console.log(JSON.stringify(result1));
            startYear = tempyear;
        }

        res.status(201).json(result);
    } catch (err) {
        res.status(409).json(err.toString());
    }
});

module.exports = router;