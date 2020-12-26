const md5 = require("md5");
const tool = require("./lib/tool");
const db = require("./lib/db");

function setup({ app, instance }) {
  app.get("/api/company", async (req, res) => {
    let resp = {
      success: true,
      data: [],
      message: "",
    };
    let id = req.query.id ? req.query.id : null;
    let perPage = req.query.perPage ? req.query.perPage : 20;
    let pageNumber = req.query.pageNumber ? req.query.pageNumber : 1;
    let query = "SELECT * FROM company";
    if (id)
      query = `SELECT * FROM company WHERE id = ${id} limit ${perPage} OFFSET ${
        (pageNumber - 1) * perPage
      }`;

    let company = await new Promise((resolve, reject) => {
      db.query(query, (error, rows, fields) => {
        if (error) {
          tool.connectionRelease;
          resp.success = false;
          resp.message = "DB error";
          res.status(500).send(resp);
        } else {
          tool.connectionRelease;
          resolve(rows);
        }
      });
    });
    resp.data = company;
    res.send(resp);
  });
  app.post("/api/company", async (req, res) => {
    let resp = {
      success: true,
      data: [],
      message: "",
    };
    let company = req.body.data;

    let query = ``;
    if (company.name && company.phone) {
      company.industry = company.industry ? company.industry : "";
      company.info = company.info ? company.info : "";
      company = tool.cleanse(company);

      query = `INSERT INTO company (name, industry,  phone, info )
      values (
          '${company.name}',
          '${company.industry}',
          '${company.phone}',
          '${company.info}'
      )
      `;

      await new Promise((resolve, reject) => {
        db.query(query, (error, rows, fields) => {
          if (error) {
            tool.connectionRelease;
            resp.success = false;
            resp.message = error.toString();
            res.status(500).send(resp);
          } else {
            tool.connectionRelease;
            res.send(resp);
          }
        });
      });
    } else {
      resp.success = false;
      res.message = "wrong data";
      res.status(400).send(resp);
    }
  });
  app.put("/api/company", async (req, res) => {
    let resp = {
      success: true,
      data: [],
      message: "",
    };
    let company = req.body.data;

    let query = ``;
    if (company.id) {
      company.name = company.name ? company.name : "";
      company.phone = company.phone ? company.phone : "";
      company.industry = company.industry ? company.industry : "";
      company.info = company.info ? company.info : "";
      company = tool.cleanse(company);

      query = `UPDATE  company 
      SET 
        name =   '${company.name}',
        industry =  '${company.industry}',
        phone =   '${company.phone}',
        info =  '${company.info}'
      WHERE id = ${company.id}
      `;
      await new Promise((resolve, reject) => {
        db.query(query, (error, rows, fields) => {
          if (error) {
            tool.connectionRelease;
            resp.success = false;
            resp.message = error.toString();
            res.status(500).send(resp);
          } else {
            tool.connectionRelease;
            resp.data = rows;
            res.send(resp);
          }
        });
      });
    } else {
      resp.success = false;
      res.message = "wrong data";
      res.status(400).send(resp);
    }
  });
}

module.exports = {
  setup,
};
