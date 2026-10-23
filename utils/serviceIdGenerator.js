const Order = require("../models/Order");

const generateServiceId = async () => {
  const last = await Order.findOne().sort({ createdAt: -1 });
  let nextNum = 10001;
  if (last && last.serviceId) {
    const num = parseInt(last.serviceId.replace("SRV-", ""), 10);
    if (!isNaN(num)) nextNum = num + 1;
  }
  return `SRV-${nextNum}`;
};

module.exports = generateServiceId;