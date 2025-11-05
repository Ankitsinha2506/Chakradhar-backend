const express = require("express");
const route = express.Router();
const BhajanSangrahController = require("../controllers/BhajanSangrahController");
const { protect, isAdminOrSuperAdmin } = require("../middelwares/adminAuth");

route.post(
  "/create",
  protect,
  isAdminOrSuperAdmin,
  BhajanSangrahController.createBhajanSangrah
);
route.get(
  "/read",
  protect,
  isAdminOrSuperAdmin,
  BhajanSangrahController.getAllBhajanSangrah
);
route.put(
  "/update/:id",
  protect,
  isAdminOrSuperAdmin,
  BhajanSangrahController.updateBhajanSangrah
);
route.delete(
  "/delete/:id",
  protect,
  isAdminOrSuperAdmin,
  BhajanSangrahController.deleteBhajanSangrah
);
route.get("/find", BhajanSangrahController.findBhajanSangrahbyTitleOrSubtitle);

module.exports = route;
