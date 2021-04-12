const md5 = require("md5");
const tool = require("./lib/tool");
const sql = require('mssql')
const moment = require('moment'); // require
require('dotenv').config()

function setup({ app, instance }) {
    app.get("/api/paymentItemDetail", async (req, res) => {
        let resp = {
            success: true,
            data: [],
            message: "",
        };
        try {
            // make sure that any items are correctly URL encoded in the connection string
            await sql.connect(`mssql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_MAIN}`)
            const result = await sql.query`select * from SalesItemDetail `
            resp.data = result;
        } catch (err) {
            //
        }

        res.status(200).send(resp);
    });
    app.post("/api/paymentItemDetail", async (req, res) => {
        let sales = req.body.data;


        let resp = {
            success: true,
            data: [],
            message: "",
        };
        if (sales) {
            let qry = `  INSERT INTO [dbo].[SalesItemDetail]
        ([SaleNo]
            ,[StationNo]
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
            for (let j = 0; j < sales.length; j += 1) {
                qry += `
           (
        ${sales[j].SaleNo},
        '${sales[j].StationNo}',
        '${sales[j].ItemCode}',
        '${sales[j].ItemName}',
        ${sales[j].Quantity},
        ${sales[j].UnitPrice},
        ${sales[j].Vat},
        ${sales[j].CityTax},
        ${sales[j].TotalAmount},
        ${sales[j].OriginalAmount},
        '${sales[j].NozzleNo}',
        ${sales[j].TradeId},
        ${sales[j].TradeDate ? "'" + sales[j].TradeDate + "'" : 'null'}
         ),`
            }

            try {
                await sql.connect(`mssql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_MAIN}`)
                const result = await sql.query(qry.slice(0, -1));
                resp.message = `Affected Detail rows count : ${result.rowsAffected[0]}`
            } catch (err) {
                //
                console.log("qry ERRROR", err);
            }

        }
        res.status(200).send(resp);

    });
    app.put("/api/paymentItemDetail", async (req, res) => {
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
