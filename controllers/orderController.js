const Order = require("../models/Order");
const Customer = require("../models/Customer");
const generateServiceId = require("../utils/serviceIdGenerator");

const PRICE = { breakfast: 50, lunch: 70, dinner: 50 };

/**
 * Creates one order for a customer and updates their totals.
 * Used by manual orders and by the auto-order runner.
 * `customer` must be a Mongoose Customer document.
 */
const placeOrder = async (customer, { date, bc, lc, dc }) => {
  const totalCost = bc * PRICE.breakfast + lc * PRICE.lunch + dc * PRICE.dinner;
  const serviceId = await generateServiceId();

  const order = await Order.create({
    serviceId,
    customer: customer._id,
    customerId: customer.customerId,
    email: customer.email,
    date,
    breakfastCount: bc,
    lunchCount: lc,
    dinnerCount: dc,
    totalCost,
  });

  // update customer totals
  customer.totalMeals += bc + lc + dc;
  customer.currentBalance -= totalCost;
  await customer.save();

  return order;
};

exports.PRICE = PRICE;
exports.placeOrder = placeOrder;

// @desc Create an order (customer for self; admin/staff for any customer via `customer` id)
exports.createOrder = async (req, res) => {
  try {
    const { date, breakfastCount, lunchCount, dinnerCount, customer: customerRef } = req.body;

    const isPrivileged = ["admin", "staff"].includes(req.user.role);
    const customer =
      isPrivileged && customerRef
        ? await Customer.findById(customerRef)
        : await Customer.findOne({ user: req.user._id });

    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    const bc = Number(breakfastCount) || 0;
    const lc = Number(lunchCount) || 0;
    const dc = Number(dinnerCount) || 0;

    const order = await placeOrder(customer, { date, bc, lc, dc });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Get my orders (customer)
exports.getMyOrders = async (req, res) => {
  try {
    const customer = await Customer.findOne({ user: req.user._id });
    if (!customer) return res.status(404).json({ message: "Not found" });

    const orders = await Order.find({ customer: customer._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all orders (admin/staff)
exports.getAllOrders = async (req, res) => {
  try {
    // populate customer so name, phone and address come with each order
    const orders = await Order.find()
      .populate("customer", "name customerId phone email address")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update an order (admin)
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Not found" });

    const { date, breakfastCount, lunchCount, dinnerCount } = req.body;
    const customer = await Customer.findById(order.customer);
    if (!customer) return res.status(404).json({ message: "Customer missing" });

    // revert old totals
    customer.totalMeals -= order.breakfastCount + order.lunchCount + order.dinnerCount;
    customer.currentBalance += order.totalCost;

    const bc = Number(breakfastCount) || 0;
    const lc = Number(lunchCount) || 0;
    const dc = Number(dinnerCount) || 0;
    const newCost = bc * PRICE.breakfast + lc * PRICE.lunch + dc * PRICE.dinner;

    order.date = date || order.date;
    order.breakfastCount = bc;
    order.lunchCount = lc;
    order.dinnerCount = dc;
    order.totalCost = newCost;
    await order.save();

    customer.totalMeals += bc + lc + dc;
    customer.currentBalance -= newCost;
    await customer.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete an order (admin)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Not found" });

    const customer = await Customer.findById(order.customer);
    if (customer) {
      customer.totalMeals -= order.breakfastCount + order.lunchCount + order.dinnerCount;
      customer.currentBalance += order.totalCost;
      await customer.save();
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};