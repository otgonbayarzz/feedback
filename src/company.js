
const md5 = require('md5');
function setup({ app, instance }) {
    app.get('/api/company', async (req, res) => {
        console.log(md5('message'));
        res.send("company")
    });
    app.post('/api/company', async (req, res) => {
        
    });
    app.put('/api/company', async (req, res) => {
        
    });
  }
  
  module.exports = {
    setup,
  };
  