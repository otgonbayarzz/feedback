
const sql = require('mssql')
module.exports = async () => {
    try {
        // make sure that any items are correctly URL encoded in the connection string
        await sql.connect('mssql://sa:123qweASD@localhost/t')

    } catch (err) {
        // ... error checks
    }
}


