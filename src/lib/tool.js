const db = require("./db");

function connectionCheck() {
  return new Promise((resolve, reject) => {
    db.getConnection(function (err, connection) {
      if (err) {
        if (connection) connection.release();
        reject(err);
      } else {
        resolve("success");
      }
    });
  });
}

function connectionRelease() {
  db.on("release", function (connection) {
    console.log("Connection %d released", connection.threadId);
  });
}

function cleanse(obj) {
  let checkKeys = [
    "name",
    "industry",
    "phone",
    "left_reason",
    "firstname",
    "lastname",
    "phone_number",
    "reg_number",
  ];
  if (obj)
    for (const [key, value] of Object.entries(obj)) {
      if (value && checkKeys.includes(key)) {
        obj[key] = value
          .toString()
          .replace(/\s/g, "")
          .replace(/"/g, "’")
          .replace(/'/g, "’");
      }
    }
  return obj;
}
module.exports = {
  connectionCheck: connectionCheck(),
  connectionRelease: connectionRelease(),
  cleanse: cleanse,
};
