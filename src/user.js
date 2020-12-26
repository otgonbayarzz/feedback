const md5 = require("md5");
const tool = require("./lib/tool");
const db = require("./lib/db");

function setup({ app, instance }) {
  app.get("/api/user", async (req, res) => {
    let resp = {
      success: true,
      data: [],
      message: "",
    };
    let id = req.query.id ? req.query.id : null;
    let perPage = req.query.perPage ? req.query.perPage : 20;
    let pageNumber = req.query.pageNumber ? req.query.pageNumber : 1;
    let query = "SELECT * FROM user";
    if (id)
      query = `SELECT * FROM user WHERE id = ${id} limit ${perPage} OFFSET ${
        (pageNumber - 1) * perPage
      }`;

    let user = await new Promise((resolve, reject) => {
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
    resp.data = user;
    res.send(resp);
  });
  app.post("/api/user", async (req, res) => {
    let resp = {
      success: true,
      data: [],
      message: "",
    };
    let user = req.body.data;

    let query = ``;
    if (user.name && user.phone) {
      query = `
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
  app.put("/api/user", async (req, res) => {
    let resp = {
      success: true,
      data: [],
      message: "",
    };
    let user = req.body.data;

    let query = ``;
    if (user.id) {
      user = tool.cleanse(user);

      query = `
      
      `;
      console.log(query);
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
