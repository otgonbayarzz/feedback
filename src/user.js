
function setup({ app, instance }) {
    app.get('/api/user', async (req, res) => {
        res.send("user")
    });
    app.post('/api/user', async (req, res) => {

    });
    app.put('/api/user', async (req, res) => {

    });
}

module.exports = {
    setup,
};
