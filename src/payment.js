const md5 = require("md5");
const tool = require("./lib/tool");
const sql = require('mssql')
const moment = require('moment'); // require

const excel = require("exceljs");
require('dotenv').config()

function setup({ app, instance }) {
    app.get("/api/payment", async (req, res) => {
        let resp = {
            success: true,
            data: [],
            message: "",
        };
        // stationNo=${stationNo}&
        // itemName=${itemName}&
        // startDate=${startDate}&
        // endDate=${endDate}&
        let perPage = req.query.perPage ? req.query.perPage : 50;
        // let perPage = 2;
        let pageNumber = req.query.pageNumber ? req.query.pageNumber : 1;
        let itemName = req.query.itemName && req.query.itemName !== undefined && req.query.itemName !== "undefined" ? req.query.itemName : "";
        let stationNo = req.query.stationNo && req.query.stationNo !== undefined && req.query.stationNo !== "undefined" ? req.query.stationNo : "";
        let startDate = req.query.startDate && req.query.startDate !== undefined && req.query.startDate !== "undefined" ? req.query.startDate : "";
        let endDate = req.query.endDate && req.query.endDate !== undefined && req.query.endDate !== "undefined" ? req.query.endDate : "";
        let fQuery = ``
        if (itemName.length > 0 || startDate.length > 0 || stationNo.length > 0 || endDate.length > 0) {

            if (itemName.length > 0) fQuery = fQuery + ` AND b.ItemName =N'${itemName}' `

            if (stationNo.length > 0) fQuery = fQuery + `AND b.StationNo =N'${stationNo}' `

            if (startDate.length > 0 && endDate.length > 0) {
                fQuery = fQuery + `AND a.SaleDate BETWEEN '${startDate}' AND  '${endDate}' `

            }
            else {
                if (startDate.length > 0) fQuery = fQuery + `AND a.SaleDate > '${startDate}' `

                if (endDate.length > 0) fQuery = fQuery + ` AND a.SaleDate < '${endDate} '`

            }
            console.log(fQuery)

        }
        else {
            fQuery = `  `
        }

        try {
            await sql.connect(`mssql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_MAIN}`)
            let ctqry = `
            select count(1) as cnt
            from Sales a
            inner join 
            SalesItemDetail b on 
            a.SaleNo = b.SaleNo
            WHERE 1=1 
            AND b.SaleNo = b.Id
            ${fQuery}
            `
            let countQuery = await sql.query(ctqry);
            if (pageNumber === 0)
                pageNumber = 1
            let cnt = countQuery.recordset[0].cnt;
            if (pageNumber === 1 && cnt > 50 && 100 < cnt)
                perPage = 50
            else if (Math.floor(cnt / 50) === pageNumber) {
                perPage = cnt - pageNumber * 50;
            }
            console.log(cnt)
            console.log(perPage)
            console.log(pageNumber)

            let qqq = `                
            select a.SaleNo as SaleNo, a.StationName StationName, a.CardAmount as CardAmount, 
                a.CashAmount as CashAmount, b.Quantity as Quantity, b.ItemName as ItemName, a.SaleDate as SaleDate, b.UnitPrice as UnitPrice, b.NozzleNo as NozzleNo
                from Sales a
                inner join 
                SalesItemDetail b on 
                a.SaleNo = b.SaleNo
                WHERE 1=1 
                AND b.SaleNo = b.Id
                ${fQuery}
                order by a.SaleNo 
                offset  ${(pageNumber - 1) * perPage} rows
                fetch next ${perPage} rows only
                `
            let exportData = `                
                select a.SaleNo as SaleNo, a.StationName StationName, a.CardAmount as CardAmount, 
                    a.CashAmount as CashAmount, b.Quantity as Quantity, b.ItemName as ItemName, a.SaleDate as SaleDate, b.UnitPrice as UnitPrice, b.NozzleNo as NozzleNo
                    from Sales a
                    inner join 
                    SalesItemDetail b on 
                    a.SaleNo = b.SaleNo
                    WHERE 1=1 
                    AND b.SaleNo = b.Id
                    ${fQuery}
                    order by a.SaleNo 
                    `
            const result = await sql.query(qqq)


            resp.data = result.recordset
            const exportResult = await sql.query(exportData)
            resp.exportData = exportResult.recordset
            resp.cnt = cnt;
        } catch (err) {
            console.log("------", err)
        }
        res.status(200).send(resp);
    });

    app.get("/api/paymentDownload", async (req, res) => {
        let resp = {
            success: true,
            data: [],
            message: "",
        };

        let perPage = req.query.perPage ? req.query.perPage : 50;
        let pageNumber = req.query.pageNumber ? req.query.pageNumber : 1;
        let itemName = req.query.itemName && req.query.itemName !== undefined && req.query.itemName !== "undefined" ? req.query.itemName : "";
        let stationNo = req.query.stationNo && req.query.stationNo !== undefined && req.query.stationNo !== "undefined" ? req.query.stationNo : "";
        let startDate = req.query.startDate && req.query.startDate !== undefined && req.query.startDate !== "undefined" ? req.query.startDate : "";
        let endDate = req.query.endDate && req.query.endDate !== undefined && req.query.endDate !== "undefined" ? req.query.endDate : "";
        let fQuery = ``
        if (itemName.length > 0 || startDate.length > 0 || stationNo.length > 0 || endDate.length > 0) {

            if (itemName.length > 0) fQuery = fQuery + ` AND b.ItemName =N'${itemName}' `

            if (stationNo.length > 0) fQuery = fQuery + `AND b.StationNo =N'${stationNo}' `

            if (startDate.length > 0 && endDate.length > 0) {
                fQuery = fQuery + `AND a.SaleDate BETWEEN '${startDate}' AND  '${endDate}' `

            }
            else {
                if (startDate.length > 0) fQuery = fQuery + `AND a.SaleDate > '${startDate}' `

                if (endDate.length > 0) fQuery = fQuery + ` AND a.SaleDate < '${endDate} '`

            }
            console.log(fQuery)

        }
        else {
            fQuery = `  `
        }

        try {


            let exportData = `                
                select a.SaleNo as SaleNo, a.StationName StationName, a.CardAmount as CardAmount, 
                    a.CashAmount as CashAmount, b.Quantity as Quantity, b.ItemName as ItemName, a.SaleDate as SaleDate, b.UnitPrice as UnitPrice, b.NozzleNo as NozzleNo
                    from Sales a
                    inner join 
                    SalesItemDetail b on 
                    a.SaleNo = b.SaleNo
                 
                    order by a.SaleNo 
                    `
            const exportResult = await sql.query(exportData)

            let qq = [];

            exportResult.recordset.forEach((obj) => {
                qq.push({
                    SaleNo: obj.SaleNo,
                    StationName: obj.StationName,
                    NozzleNo: obj.NozzleNo,
                    ItemName: obj.ItemName,
                    UnitPrice: obj.UnitPrice,
                    Quantity: obj.Quantity,
                    CardAmount: obj.CardAmount,
                    CashAmount: obj.CashAmount,
                    SaleDate: obj.SaleDate,
                });
            });

            let workbook = new excel.Workbook();
            let worksheet = workbook.addWorksheet("qqq");

            worksheet.columns = [
                { header: "Гүйлгээний дугаар", key: "SaleNo", width: 15 },
                { header: "Салбарын нэр", key: "StationName", width: 15 },
                { header: "Хошууны дугаар", key: "NozzleNo", width: 15 },
                { header: "Бүтээгдэхүүн", key: "ItemName", width: 15 },
                { header: "Нэгжийн үнэ", key: "UnitPrice", width: 15 },
                { header: "Тоо Хэмжээ", key: "Quantity", width: 15 },
                { header: "Картаар төлсөн", key: "CardAmount", width: 15 },
                { header: "Бэлнээр төлсөн", key: "CashAmount", width: 15 },
                { header: "Гүйлгээний хугацаа", key: "SaleDate", width: 15 }
            ];

            // Add Array Rows

            worksheet.addRows(qq);


            res.setHeader(
                "Content-Type",
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=qqqqq.xlsx"
            );

            await workbook.xlsx.writeFile('export2.xlsx');

            console.log("File is written");
            return workbook.xlsx.write(res).then(function () {
                res.status(200).end();
            });


        } catch (err) {
            console.log("------", err)
        }

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

            } catch (err) {
                console.log(err)
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
