const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
require("dotenv").config();
const { Server } = require("socket.io");
const axios = require("axios");

const authRoutes = require("./routes/auth");
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.use("/api/auth", authRoutes);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// ✅ Socket.IO handlers
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("user-location", async ({ latitude, longitude, userId }) => {
        console.log("📍 Received location:", latitude, longitude);

        try {
            // Reverse geocoding with LocationIQ
            const response = await axios.get("https://us1.locationiq.com/v1/reverse", {
                params: {
                    key: process.env.ACCESS_KEY,
                    lat: latitude,
                    lon: longitude,
                    format: "json",
                },
            });

            const address = response.data.display_name;

            // Save location and address to DB
            await User.findByIdAndUpdate(userId, {
                location: { latitude, longitude, address, },

            });

            console.log(`✅ Location & address saved for user ${userId}`);
        } catch (error) {
            console.error("❌ Failed to update user location:", error.message);
        }
    });


    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});


// ✅ MongoDB + Server Start
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB connected");
        const PORT = process.env.PORT || 3001;
        server.listen(PORT, () => {
            console.log(`🚀 Server with Socket.IO running on port ${PORT}`);
        });
    })
    .catch((err) => console.error("❌ MongoDB connection error:", err));
