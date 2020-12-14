const httpLib = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const { setup: company } = require('./src/company');
const { setup: contract } = require('./src/contract');
const { setup: prospect } = require('./src/prospect');
const { setup: user } = require('./src/user');

const Singleton = (function f() {
  let instance;
  async function createInstance() {
    const object = {};
    return object;
  }

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
}());

const app = express();
const http = httpLib.createServer(app);
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({ msg: 'Server is online.' });
});

http.listen(3000, () => {
  console.log("api on")
  const instance = Singleton.getInstance();

  company({ app, instance });
  contract({ app, instance });
  prospect({ app, instance });
  user({ app, instance });

});
