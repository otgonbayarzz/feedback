
function setup({ app, instance }) {
    app.get('/api/prospect', async (req, res) => {
        res.send("prospect")

    });
    app.post('/api/prospect', async (req, res) => {

    });
    app.put('/api/prospect', async (req, res) => {

    });
}

module.exports = {
    setup,
};
