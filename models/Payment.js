const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    customerId: { type: String, required: true },
    amount: { type: Number, required: true },
    screenshot: { type: String, default: "" },
    status: {
      type: String,
      enum: ["processing", "confirmed", "rejected"],
      default: "processing",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);