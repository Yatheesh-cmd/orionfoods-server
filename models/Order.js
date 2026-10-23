const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    serviceId: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    customerId: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: String, required: true },
    breakfastCount: { type: Number, default: 0 },
    lunchCount: { type: Number, default: 0 },
    dinnerCount: { type: Number, default: 0 },
    totalCost: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);