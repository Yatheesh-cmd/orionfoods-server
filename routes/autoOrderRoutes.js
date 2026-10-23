const express = require("express");
const router = express.Router();
// Use the same auth middleware import as your orderRoutes.js
const { protect } = require("../middleware/authMiddleware");
const { getMine, saveMine } = require("../controllers/autoOrderController");

router.get("/me", protect, getMine);
router.put("/me", protect, saveMine);

module.exports = router;