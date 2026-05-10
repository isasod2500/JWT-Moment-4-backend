const express = require("express")
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")
require("dotenv").config();

mongoose.set("strictQuery", false);
mongoose.connect(process.env.DATABASE).then(() => {
    console.log(`Connected to mongoDB`);
}).catch((err) => {
    console.error(`error: ${err}`)
});

const User = require("../models/user.js")

router.get("/", async (req, res) => {
    res.json({ message: "API NÅDD" });
});

app.get("/users", async (req, res) => {
    try {
        let result = await User.find({});
        console.log(result)
        return res.json(result)
    } catch (err) {
        console.error(err)
        return res.status(500).json({
            message: err.message})
    }
})

router.post("/register", async (req, res) => {
    try {
        const {  username, password, firstname, surname, email, birthdate } = req.body;
        console.log(req.body)

        if (!username || !password) {
            return res.status(400).json({ error: `Invalid input, send username and password` })
        }

        const user = new User({ username, password, firstname, surname, email, birthdate  })
        await user.save();

        res.status(201).json({ message: `User created` })

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: `Username is not available.` })
        }
        res.status(500).json({ error: `${err}` })
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password || !email || !age) {
            return res.status(400).json({ error: `Invalid input: Username, password, email and age has to be provided.` })
        }


        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "Incorrect username or password" })
        }

        const matchingPassword = await user.comparePassword(password);
        if (!matchingPassword) {
            return res.status(401).json({ error: "Incorrect username or password" })
        }

        //Create webtoken
        const payload = { username: username };
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "1h" })

        user = await User.findOne({ username: username }, {password:0});
        const response = {
            user,
            token
        }
        res.status(200).json({ response });

    } catch (err) {
        res.status(500).json({ error: `${err}` })
    }
});

module.exports = router;
