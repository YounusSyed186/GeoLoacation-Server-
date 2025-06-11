const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: {
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
        address: { type: String },
    },
});

module.exports = mongoose.model("User", userSchema);
