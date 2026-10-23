require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const autoOrderRoutes = require("./routes/autoOrderRoutes");
const { startAutoOrderScheduler } = require("./utils/autoOrderRunner");

// ensure uploads dir
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/auto-orders", autoOrderRoutes);

app.get("/", (req, res) => res.json({ message: "Food ordering API running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startAutoOrderScheduler();
});