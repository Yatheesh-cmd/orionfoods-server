const mongoose = require("mongoose");

const daySchema = new mongoose.Schema(
  {
    breakfastCount: { type: Number, default: 0, min: 0, max: 99 },
    lunchCount: { type: Number, default: 0, min: 0, max: 99 },
    dinnerCount: { type: Number, default: 0, min: 0, max: 99 },
  },
  { _id: false }
);

const autoOrderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, unique: true },
    enabled: { type: Boolean, default: false },
    // index = JS getDay(): 0 Sunday ... 6 Saturday
    schedule: {
      type: [daySchema],
      default: () => Array.from({ length: 7 }, () => ({})),
    },
    // YYYY-MM-DD of the last day an order was generated (prevents duplicates)
    lastRunDate: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AutoOrder", autoOrderSchema);