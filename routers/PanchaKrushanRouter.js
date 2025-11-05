const express = require("express");
const router = express.Router();
const PanchaKrushnaController = require("../controllers/PanchaKrushnaController");
const { protect, isAdminOrSuperAdmin } = require("../middelwares/adminAuth");

// Routes
router.post(
  "/create",
  protect,
  isAdminOrSuperAdmin,
  PanchaKrushnaController.createPanchaKrushna
);
router.get(
  "/read",
  protect,
  isAdminOrSuperAdmin,
  PanchaKrushnaController.getAllPanchaKrushna
);
router.put(
  "/update/:id",
  protect,
  isAdminOrSuperAdmin,
  PanchaKrushnaController.updatePanchaKrushna
);
router.delete(
  "/delete/:id",
  protect,
  isAdminOrSuperAdmin,
  PanchaKrushnaController.deletePanchaKrushna
);

module.exports = router;
