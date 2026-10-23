require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");

const seed = async () => {
  await connectDB();

  const adminEmail = "admin@food.com";
  const staffEmail = "staff@food.com";

  await User.deleteMany({ email: { $in: [adminEmail, staffEmail] } });

  await User.create({
    name: "Admin User",
    email: adminEmail,
    phone: "9000000001",
    address: "Admin Office",
    password: "admin123",
    role: "admin",
  });

  await User.create({
    name: "Staff User",
    email: staffEmail,
    phone: "9000000002",
    address: "Staff Office",
    password: "staff123",
    role: "staff",
  });

  console.log("Seeded admin & staff accounts:");
  console.log(`Admin: ${adminEmail} / admin123`);
  console.log(`Staff: ${staffEmail} / staff123`);

  await mongoose.disconnect();
  process.exit(0);
};

seed();