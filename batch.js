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
        console.log("max id detaul : ", maxIdDetail)
        const result = await sql.query`select * from Sales where SaleNo > ${maxId}`
        const resultDetail = await sql.query`select * from SalesItemDetail where SaleNo > ${maxIdDetail}`


        if (result.recordset.length > 0) {
            let ids = result.recordset.map(i => i.SaleNo)
            maxId = Math.max.apply(null, ids);
            let res = await axios
                .create({
                    timeout: 40000
                })
                .post('http://localhost:3001/api/payment/', { "data": result.recordset })
                .catch(function (error) {
                    console.log("backend error", error);
                });
            console.log(res.data);
        }
        else {
            sleep(6000);
            console.log("##############sleeping##################");
        }

        if (resultDetail.recordset.length > 0) {
            let ids = resultDetail.recordset.map(i => i.SaleNo)
            maxId = Math.max.apply(null, ids);
            let res1 = await axios
                .create({
                    timeout: 40000
                })
                .post(`${process.env.API_URL}/api/paymentItemDetail/`, { "data": resultDetail.recordset })
                .catch(function (error) {
                    console.log("backend error", error);
                });
            console.log(res1.data);
        }
        else {
            sleep(6000);
            console.log("##############sleeping##################");
        }

    } catch (err) {
        console.log("here", err)
    }
}

async function a() {
    while (true) {
        main();
        await sleep(6000);
        console.log("##############sleeping##################");
    }
}

a();
