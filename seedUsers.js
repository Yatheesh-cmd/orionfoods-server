require("dotenv").config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const User = require("./models/User");

// Change names/emails here if you want
const USERS = [
  {
    name: "Admin",
    email: "admin@orion.com",
    phone: "9999999999",
    address: "Head Office",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Staff",
    email: "staff@orion.com",
    phone: "8888888888",
    address: "Kitchen",
    password: "staff123",
    role: "staff",
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected:", mongoose.connection.host);

    for (const data of USERS) {
      const existing = await User.findOne({ email: data.email });

      if (existing) {
        // update so the password is re-hashed by the pre-save hook
        existing.name = data.name;
        existing.phone = data.phone;
        existing.address = data.address;
        existing.role = data.role;
        existing.password = data.password;
        await existing.save();
        console.log(`Updated ${data.role}: ${data.email}`);
      } else {
        await User.create(data);
        console.log(`Created ${data.role}: ${data.email}`);
      }
    }
  } catch (err) {
    console.error("Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();