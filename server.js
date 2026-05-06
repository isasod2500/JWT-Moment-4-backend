const express = require("express");
const bodyParser = require("body-parser")
const routes = require("./routes/routes")
const jwt = require("jsonwebtoken")
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

app.get("/api/admin", authenticateToken, (req, res) => {
    
    res.json({ message: `Admin route, protected` })
})

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (token == null) res.status(401).json({ message: "Not authorised" })

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, username) => {
        if (err) return res.status(403).json({ message: `${err}` })
        req.username = username
        next();
    })
}

app.use("/api", routes)

app.listen(port, () => {
    console.log(`Started on ${port}`)
})