const sql = require('mssql')
const axios = require('axios').default;
require('dotenv').config()
const moment = require('moment'); // require
var time = moment.duration("00:04:00");




let maxId = 0;
let maxIdDetail = 0;
let maxIdTrade = 0;
const sleep = async (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
async function main() {

    try {
        await sql.connect(`mssql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_CLIENT}`)
        let rr = await sql.query`select * from Trade where TradeId > ${maxIdTrade}`
        if (rr.recordset.length > 0) {

            let ids = rr.recordset.map(i => i.TradeId)
            maxIdTrade = Math.max.apply(null, ids);
            let batchUpdate = await sql.query`UPDATE BatchStatus set LastValue = ${maxIdTrade} WHERE TableName = 'Trade'`

            let sales = rr.recordset;

            for (let j = 0; j < sales.length; j += 1) {
                let qry = `  INSERT INTO [dbo].[SalesItemDetailOffline]
            (
            [StationNo]
            ,[ItemCode]
            ,[ItemName]
            ,[Quantity]
            ,[UnitPrice]
            ,[Vat]
            ,[CityTax]
            ,[TotalAmount]
            ,[OriginalAmount]
            ,[NozzleNo]
            ,[TradeId]
            ,[TradeDate]
            )
      VALUES`;
                qry += `
               (
            'Shts-02',
            '${sales[j].ItemCode}',
            N'${sales[j].ItemName}',
            ${sales[j].Quantity},
            ${sales[j].UnitPrice},
            0,
            0,
            ${sales[j].TotalAmount},
            ${sales[j].TotalAmount},
            '${sales[j].NozzleNo}',
            ${sales[j].TradeId},
            '${moment.utc(sales[j].TradeDate).format("YYYY-MM-DD HH:mm:ss")}'
             )`
                try {
                    await sql.connect(`mssql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_CLIENT}`)
                    const result = await sql.query(qry);
                } catch (err) {
                    console.log(err);
                }
            }



            for (let j = 0; j < sales.length; j += 1) {
                let qry1
                    = `INSERT INTO [dbo].[SalesOffline]
                    (
                    [BillId]
                    ,[SaleDate]
                    ,[StationNo]
                    ,[StationName]
                    ,[PosId]
                    ,[CustomerNo]
                    ,[CustomerName]
                    ,[IsReturned]
                    ,[ReturnedDate]
                    ,[Vat]
                    ,[CityTax]
                    ,[TotalAmount]
                    ,[OriginalAmount]
                    ,[CashAmount]
                    ,[CardAmount]
                    ,[OtherAmount]
                    ,[CreatedDate])
            VALUES`;
                qry1 += `
                    (
                        '', 
                        '${moment.utc(sales[j].TradeDate).format("YYYY-MM-DD HH:mm:ss")}'
                    ,'002'
                    ,'Shts-02'
                    ,''
                    ,''
                    ,''
                    ,''
                    ,${sales[j].ReturnedDate ? "'" + sales[j].ReturnedDate + "'" : 'null'}
                    ,0
                    ,0
                    ,${sales[j].TotalAmount}
                    ,${sales[j].TotalAmount}
                    ,${sales[j].TotalAmount}
                    ,0
                    ,0
                    ,'${moment.utc(sales[j].TradeDate).format("YYYY-MM-DD HH:mm:ss")}'
                    )`
                try {

                    await sql.connect(`mssql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_CLIENT}`)
                    const result = await sql.query(qry1);

                } catch (err) {
                    //

                    console.log(err)
                }
            }






        }




        console.log("max id detail : ", maxIdDetail)
        console.log("max id  : ", maxId)
        console.log("max id Trade : ", maxIdTrade)
        const result = await sql.query`select * from SalesOffline where SaleNo > ${maxId}`
        const resultDetail = await sql.query`select * from SalesItemDetailOffline where SaleNo > ${maxIdDetail}`
        if (result.recordset.length > 0) {
            let ids = result.recordset.map(i => i.SaleNo)
            maxId = Math.max.apply(null, ids);
            for (let j = 0; j < result.recordset.length; j += 1) {
                let tt = []
                tt.push(result.recordset[j])
                let res = await axios
                    .create({
                        timeout: 40000
                    })
                    .post(`${process.env.API_URL}/api/payment/`, { "data": tt })
                    .catch(function (error) {
                        console.log("backend error", error);
                    });

                let batchUpdate = await sql.query`UPDATE BatchStatus set LastValue = ${maxId} WHERE TableName = 'Sales'`
            }
        }
        else {
            sleep(6000);
            console.log("##############sleeping##################");
        }

        if (resultDetail.recordset.length > 0) {
            let ids = resultDetail.recordset.map(i => i.SaleNo)
            maxIdDetail = Math.max.apply(null, ids);
            for (let j = 0; j < resultDetail.recordset.length; j += 1) {
                let tt = []
                tt.push(resultDetail.recordset[j])
                
                let res1 = await axios
                .create({
                    timeout: 40000
                })
                .post(`${process.env.API_URL}/api/paymentItemDetail/`, { "data": tt })
                .catch(function (error) {
                    console.log("backend error", error);
                });

            }
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
        const trade = await sql.query`select * from BatchStatus where TableName = 'Trade'`
        const result = await sql.query`select * from BatchStatus where TableName = 'Sales'`
        const resultDetail = await sql.query`select * from BatchStatus where TableName = 'SalesItemDetail'`
        if (result.recordset.length > 0) {
            let ids1 = result.recordset.map(i => i.LastValue)
            maxId = Math.max.apply(null, ids1);
        }
        if (resultDetail.recordset.length > 0) {
            let ids2 = resultDetail.recordset.map(i => i.LastValue)
            maxIdDetail = Math.max.apply(null, ids2);
        }
        if (trade.recordset.length > 0) {
            let ids3 = trade.recordset.map(i => i.LastValue)
            maxIdTrade = Math.max.apply(null, ids3);
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
