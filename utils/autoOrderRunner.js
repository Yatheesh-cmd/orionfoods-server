const AutoOrder = require("../models/AutoOrder");
const Customer = require("../models/Customer");
const { placeOrder } = require("../controllers/orderController");

const TIMEZONE = process.env.APP_TIMEZONE || "Asia/Kolkata";
const CHECK_EVERY_MS = 30 * 60 * 1000; // 30 minutes

// "YYYY-MM-DD" for today in the app timezone
const todayIST = () => new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE });

// 0 = Sunday ... 6 = Saturday for a "YYYY-MM-DD" string
const weekdayOf = (dateStr) => new Date(`${dateStr}T00:00:00Z`).getUTCDay();

let running = false;

/**
 * Creates today's order for every enabled plan that hasn't run today.
 * Safe to call repeatedly: lastRunDate is claimed atomically, so a plan
 * can only generate one order per day (even across restarts).
 */
async function runAutoOrders() {
  if (running) return;
  running = true;

  try {
    const today = todayIST();
    const weekday = weekdayOf(today);

    const due = await AutoOrder.find({ enabled: true, lastRunDate: { $ne: today } });

    for (const plan of due) {
      const previousRun = plan.lastRunDate;
      try {
        // Claim today's run; if someone else got it first, skip.
        const claimed = await AutoOrder.findOneAndUpdate(
          { _id: plan._id, enabled: true, lastRunDate: { $ne: today } },
          { $set: { lastRunDate: today } }
        );
        if (!claimed) continue;

        const day = plan.schedule?.[weekday] || {};
        const bc = Number(day.breakfastCount) || 0;
        const lc = Number(day.lunchCount) || 0;
        const dc = Number(day.dinnerCount) || 0;
        if (bc + lc + dc === 0) continue; // day off

        const customer = await Customer.findById(plan.customer);
        if (!customer) continue;

        await placeOrder(customer, { date: today, bc, lc, dc });
      } catch (err) {
        console.error(`Auto order failed for plan ${plan._id}:`, err.message);
        // Release the claim so the next check can retry.
        await AutoOrder.updateOne({ _id: plan._id }, { $set: { lastRunDate: previousRun } }).catch(() => {});
      }
    }
  } catch (err) {
    console.error("Auto order runner error:", err.message);
  } finally {
    running = false;
  }
}

function startAutoOrderScheduler() {
  runAutoOrders();
  setInterval(runAutoOrders, CHECK_EVERY_MS);
  console.log("Auto order scheduler started");
}

module.exports = { runAutoOrders, startAutoOrderScheduler, todayIST };