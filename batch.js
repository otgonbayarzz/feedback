const sql = require('mssql')
const axios = require('axios').default;
require('dotenv').config()




let maxId = 0;
let maxIdDetail = 0;
const sleep = async (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
async function main() {

    try {
        await sql.connect(`mssql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_CLIENT}`)
        console.log("max id : ", maxId)
        console.log("max id detail : ", maxIdDetail)
        const result = await sql.query`select * from Sales where SaleNo > ${maxId}`
        const resultDetail = await sql.query`select * from SalesItemDetail where SaleNo > ${maxIdDetail}`
        if (result.recordset.length > 0) {
            let ids = result.recordset.map(i => i.SaleNo)
            maxId = Math.max.apply(null, ids);
            
            let res = await axios
                .create({
                    timeout: 40000
                })
                .post(`${process.env.API_URL}/api/payment/`, { "data": result.recordset })
                .catch(function (error) {
                    console.log("backend error", error);
                });
            console.log(res.data);
            let batchUpdate = await sql.query`UPDATE BatchStatus set LastValue = ${maxId} WHERE TableName = 'Sales'`
        }
        else {
            sleep(6000);
            console.log("##############sleeping##################");
        }

        if (resultDetail.recordset.length > 0) {
            let ids = resultDetail.recordset.map(i => i.SaleNo)
            maxIdDetail = Math.max.apply(null, ids);
            let res1 = await axios
                .create({
                    timeout: 40000
                })
                .post(`${process.env.API_URL}/api/paymentItemDetail/`, { "data": resultDetail.recordset })
                .catch(function (error) {
                    console.log("backend error", error);
                });

            console.log(res1.data);
            let batchUpdateDetail = await sql.query`UPDATE BatchStatus set LastValue = ${maxIdDetail} WHERE TableName = 'SalesItemDetail'`
        }
        else {
            sleep(6000);
        }

    } catch (err) {
        console.log("here", err)
    }
}

async function a() {
    try {
        await sql.connect(`mssql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_CLIENT}`)
        const result = await sql.query`select * from BatchStatus where TableName = 'Sales' `
        const resultDetail = await sql.query`select * from BatchStatus where TableName = 'SalesItemDetail'`
        if (result.recordset.length > 0) {
            let ids1 = result.recordset.map(i => i.LastValue)
            maxId = Math.max.apply(null, ids1);
        }
        if (resultDetail.recordset.length > 0) {
            let ids2 = resultDetail.recordset.map(i => i.LastValue)
            maxIdDetail = Math.max.apply(null, ids2);
        }
    }
    catch (err) {
        console.log("got error while getting max id");
        console.log(err)
    }

    while (true) {
        main();
        await sleep(6000);
        console.log("##############sleeping##################");
    }

}

a();
