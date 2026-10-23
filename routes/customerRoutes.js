const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/me", protect, getMyProfile);
router.get("/", protect, authorize("admin", "staff"), getAllCustomers);
router.get("/:id", protect, getCustomerById);
router.put("/:id", protect, authorize("admin"), updateCustomer);
router.delete("/:id", protect, authorize("admin"), deleteCustomer);

module.exports = router;