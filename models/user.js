const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//Modell för user
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    firstname: {
        type: String,
        trim: true
    },
    surname: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    birthdate: {
        type: Date,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});



//Innan save körs, kolla i fall lösenordet är nytt eller om det är modifierat. Om ja, hasha.
userSchema.pre("save", async function () {
    try {
        if (this.isNew || this.isModified("password")) {
            const hashedPassword = await bcrypt.hash(this.password, 10);
            this.password = hashedPassword
        }
    } catch (err) {
        throw err
    }
});

//Skapa användare 
userSchema.statics.register = async function (username, password, email, birthdate) {
    try {
        const user = new this({
            username,
            password,
            email,
            birthdate
        });
        await user.save();
        return user;

    } catch (err) {
        throw err
    }
}

userSchema.methods.comparePassword = async function (password) {
    try {
        //Jämför lösenordet som hashade, inkommande med this, dvs existerande users lösenord
        return await bcrypt.compare(password, this.password)

    } catch (err) {
        throw err
    }
}

userSchema.statics.login = async function (username, password) {
    try {
        //Inloggning med e-post ska också fungera, här kallar jag explicit lösenordet
        //då per standard tas det inte med
        const user = await this.findOne({
            $or: [
                { username: username },
                { email: username }
            ]
        }).select("+password");
        //Om användare inte hittas, skicka fel
        if (!user) {
            throw new Error(`Incorrect username or password`)
        }

        //Funktion compare med inkommande lösenord
        const matchingPassword = await user.comparePassword(password);

        //Om false, neka.
        if (!matchingPassword) {
            throw new Error(`Incorrect username or password`)
        }
        //Om inte fel, returnera användaren
        return user;

    } catch (err) {
        throw err
    }
}

//Exportera User för användning i routes.
const User = mongoose.model("User", userSchema)
module.exports = User;