const AutoOrder = require("../models/AutoOrder");
const Customer = require("../models/Customer");
const { PRICE } = require("./orderController");
const { todayIST } = require("../utils/autoOrderRunner");

const clampCount = (v) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) ? Math.max(0, Math.min(99, n)) : 0;
};

// Always returns exactly 7 days (index = JS getDay(): 0 Sunday ... 6 Saturday)
const normalizeSchedule = (input) =>
  Array.from({ length: 7 }, (_, i) => {
    const d = (Array.isArray(input) && input[i]) || {};
    return {
      breakfastCount: clampCount(d.breakfastCount),
      lunchCount: clampCount(d.lunchCount),
      dinnerCount: clampCount(d.dinnerCount),
    };
  });

const toPayload = (doc) => ({
  enabled: Boolean(doc?.enabled),
  schedule: normalizeSchedule(doc?.schedule),
  lastRunDate: doc?.lastRunDate || "",
  prices: PRICE,
});

// @desc Get my auto-order plan (customer)
exports.getMine = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return res.status(404).json({ message: "Customer profile not found" });

    const plan = await AutoOrder.findOne({ customer: customer._id });
    res.json(toPayload(plan));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Save my auto-order plan (customer)
exports.saveMine = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return res.status(404).json({ message: "Customer profile not found" });

    const enabled = Boolean(req.body.enabled);
    const schedule = normalizeSchedule(req.body.schedule);

    const totalMeals = schedule.reduce(
      (t, d) => t + d.breakfastCount + d.lunchCount + d.dinnerCount,
      0
    );
    if (enabled && totalMeals === 0) {
      return res.status(400).json({ message: "Set at least one meal for at least one day" });
    }

    const existing = await AutoOrder.findOne({ customer: customer._id });
    const update = { enabled, schedule };

    // Newly switched on: start from tomorrow (skip today's run).
    if (enabled && !existing?.enabled) update.lastRunDate = todayIST();

    const plan = await AutoOrder.findOneAndUpdate(
      { customer: customer._id },
      { $set: update, $setOnInsert: { customer: customer._id } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(toPayload(plan));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};