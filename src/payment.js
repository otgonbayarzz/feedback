const md5 = require("md5");
const tool = require("./lib/tool");
const sql = require('mssql')
const moment = require('moment'); // require
require('dotenv').config()

function setup({ app, instance }) {
    app.get("/api/payment", async (req, res) => {
        let resp = {
            success: true,
            data: [],
            message: "",
        };
        try {
            console.log("-----", `mssql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_MAIN}`);
            // make sure that any items are correctly URL encoded in the connection string
            await sql.connect(`mssql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_MAIN}`)
            const result = await sql.query`                
            select distinct a.SaleNo as SaleNo, a.StationName StationName, a.CardAmount as CardAmount, 
                a.CashAmount as CashAmount, b.Quantity as Quantity, b.ItemName as ItemName, a.SaleDate as SaleDate
                from Sales a
                right join 
                SalesItemDetail b on 
                a.SaleNo = b.SaleNo
                `
            resp.data = result.recordset;
        } catch (err) {
            console.log("------", err)
        }
        res.status(200).send(resp);
    });
    app.post("/api/payment", async (req, res) => {
        let sales = req.body.data;
        let resp = {
            success: true,
            data: [],
            message: "",
        };
        if (sales) {
            let qry = `  INSERT INTO [dbo].[Sales]
        (
            [SaleNo]
        ,[BillId]
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
            for (let j = 0; j < sales.length; j += 1) {
                qry += `
           (
            ${sales[j].SaleNo},
        '${sales[j].BillId}',
        '${sales[j].SaleDate}',
        '${sales[j].StationNo}',
        '${sales[j].StationName}',
        '${sales[j].PosId}'
        ,'${sales[j].CustomerNo}'
        ,'${sales[j].CustomerName}'
        ,'${sales[j].IsReturned}'
        ,${sales[j].ReturnedDate ? "'" + sales[j].ReturnedDate + "'" : 'null'}
        ,${sales[j].Vat}
        ,${sales[j].CityTax}
        ,${sales[j].TotalAmount}
        ,${sales[j].OriginalAmount}
        ,${sales[j].CashAmount}
        ,${sales[j].CardAmount}
        ,${sales[j].OtherAmount}
        ,'${sales[j].CreatedDate}'
         ),`
            }

            try {

                await sql.connect(`mssql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_MAIN}`)
                const result = await sql.query(qry.slice(0, -1));
                resp.message = `Affected rows count : ${result.rowsAffected[0]}`
            } catch (err) {
                //
            }

        }
        res.status(200).send(resp);

    });
    app.put("/api/payment", async (req, res) => {
        let resp = {
            success: true,
            data: [],
            message: "",
        };
        res.status(200).send(resp);
    });
}

module.exports = {
    setup,
};
