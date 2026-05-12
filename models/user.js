const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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

//Hash password

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

userSchema.statics.register = async function (username, password) {
    try {
        const user = new this({
            username,
            password
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
        console.log(user)
        //Funktion compare med inkommande lösenord
        console.log(user)
        const matchingPassword = await user.comparePassword(password);
        //Om false, neka.
        if (!matchingPassword) {
        //Om false, neka.
        if (!matchingPassword) {
            throw new Error(`Incorrect username or password`)
        }
        //Om inte fel, returnera användaren
        //Om inte fel, returnera användaren
        return user;
    } catch (err) {
        throw err
    }
}

const User = mongoose.model("User", userSchema)
module.exports = User;
