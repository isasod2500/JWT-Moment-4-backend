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


//Importera mallen user
const User = require("../models/user.js")

//Skappa index sidan, mest för att bekräfta att den faktiskt fungerar.
router.get("/", async (req, res) => {
    res.json({ message: "API NÅDD" });
});

//Route för registrera. 
//If-satser för att kolla efter upptagna användaruppgifter, nekar eller godkänner beroende på status. Sparar i MongoDB
router.post("/register", async (req, res) => {
    try {
        const { username, password, firstname, surname, email, birthdate } = req.body;
        console.log(req.body)

        if (!username || !password) {
            return res.status(400).json({ error: `Invalid input, send username and password` })
        }

        const user = new User({ username, password, firstname, surname, email, birthdate })
        await user.save();

        res.status(201).json({ message: `User created` })

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: `Username is not available.` })
        }
        res.status(500).json({ error: `${err}` })
    }
});

/*Route för login. POSTar username och password, jämför i fall allt stämmer och genererar sedan token i fall det stämmer.
Reroutar sedan till signedin om allt uppfylls.
Tillåter även inloggning med lösenord.*/
router.post("/login", async (req, res) => {
   
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: `Invalid input: Username and password has to be provided.` })
        }

        
        let user = await User.findOne({
            $or: [
                { username: username },
                { email: username }
            ]
        }).select("+password");

        
        if (!user) {
            return res.status(401).json({ error: "Incorrect username or password" })
        }

        const matchingPassword = await user.comparePassword(password);
        if (!matchingPassword) {
            return res.status(401).json({ error: "Incorrect username or password" })
        }
        
        //Create webtoken
        const payload = { username: user.username };
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "1h" })

        
        user = await User.findOne({ username: username });
        const response = {
            user,
            token
        }
        res.status(200).json(response);

    } catch (err) {
        res.status(401).json({
            error: err.message
        });
    }
});

//Hemlig sida som endast går att nå med giltig JWT token.
router.get("/secret", authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username})

        if (!user) {
            return res.status(403).json({ error: `Access denied. Username not found.` })
        }

        //Skicka till frontend för att printa ut uppgifter.
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

//Funktion som autentiserar token. I fall token saknas eller JWT SECRET KEY saknas så returneras error.
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

module.exports = router;
