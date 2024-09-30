const express = require("express")
const app = express()
const path = require("path")
const {open}=require("sqlite")
const sqlite3 = require("sqlite3")

let dbpath = path.join(__dirname,"address.db")
let db = null

const openDBandInitialServer = async()=>{
 try{
    db = await open({
        filename: dbpath,
        driver: sqlite3.Database,
    })
    app.listen(3000,()=>{
        console.log("server running at 3000 and db opened")
    })
}catch(e){
    console.log("db open error")
    process.exit(1)
}}

app.use(express.json());

app.post('/register', (request, response) => {
    const { name, address } = request.body;
    if (!name || !address) {
        return response.status(400).json({ message: 'Name and address are required.' });
    }
    const findUserQuery = `SELECT id FROM user WHERE name = ?`;

    db.get(findUserQuery, [name], (error, row) => {
        if (error) {
            return response.status(500).json({ message: 'Error querying user.', error: error.message });
        }
        if (row) {
            const userId = row.id;
            const insertAddressQuery = `INSERT INTO address (userid, address) VALUES (?, ?)`;

            db.run(insertAddressQuery, [userId, address], function(error) {
                if (error) {
                    return response.status(500).json({ message: 'Error inserting address.', error: error.message });
                }
                return response.status(200).json({ message: 'Address added successfully for existing user.', userId: userId });
            });
        } else {
            const insertUserQuery = `INSERT INTO user (name) VALUES (?)`;

            db.run(insertUserQuery, [name], function(error) {
                if (error) {
                    return response.status(500).json({ message: 'Error inserting user.', error: error.message });
                }

                const newUserId = this.lastID;
                const insertAddressQuery = `INSERT INTO address (userid, address) VALUES (?, ?)`;

                db.run(insertAddressQuery, [newUserId, address], function(error) {
                    if (error) {
                        return response.status(500).json({ message: 'Error inserting address.', error: error.message });
                    }
                    return response.status(200).json({ message: 'User and address added successfully.', userId: newUserId });
                });
            });
        }
    });
});


openDBandInitialServer()