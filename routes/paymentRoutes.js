const express = require("express");
const router = express.Router();
const {
  createPayment,
  getMyPayments,
  getAllPayments,
  updatePaymentStatus,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

router.post(
  "/",
  protect,
  authorize("customer", "admin"),
  upload.single("screenshot"),
  createPayment
);
router.get("/my", protect, authorize("customer"), getMyPayments);
router.get("/", protect, authorize("admin"), getAllPayments);
router.put("/:id", protect, authorize("admin"), updatePaymentStatus);

module.exports = router;