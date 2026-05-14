const express = require("express");
const bodyParser = require("body-parser")
const routes = require("./routes/routes")
const jwt = require("jsonwebtoken")
const cors = require("cors")
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.use(cors({
    origin: "*"
}))

const port = process.env.PORT || 3000;

app.get("/", async (req, res) => {
    res.json({ message: "API NÅDD" });
});

app.get("/signedin", authenticateToken, (req, res) => {

    res.json({ message: `Admin route, protected` })
})

app.get("/secret", authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username})

        if (!user) {
            return res.status(403).json({ error: `Access denied. Username not found.` })
        }

        res.json({
            username: user.username,
            firstname: user.firstname,
            surname: user.surname,
            email: user.email,
            created: user.created
        })


    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
})

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (token == null) {
        return res.status(401).json({ message: "Not authorised" })
    }
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decrypted) => {
        if (err) return res.status(403).json({ message: `${err}` })
        req.user = decrypted
        next();
    })
}

app.use("/api", routes)

app.listen(port, () => {
    console.log(`Started on ${port}`)
})
