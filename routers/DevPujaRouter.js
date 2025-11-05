const express = require("express");
const route = express.Router();
const DevPujaController = require("../controllers/DevPujaController");
const { protect, isAdminOrSuperAdmin } = require("../middelwares/adminAuth");

route.post(
  "/create",
  protect,
  isAdminOrSuperAdmin,
  DevPujaController.createDevPuja
);
route.get(
  "/read",
  protect,
  isAdminOrSuperAdmin,
  DevPujaController.getAllDevPuja
);
route.put(
  "/update/:id",
  protect,
  isAdminOrSuperAdmin,
  DevPujaController.updateDevPuja
);
route.delete(
  "/delete/:id",
  protect,
  isAdminOrSuperAdmin,
  DevPujaController.deleteDevPuja
);
route.get("/find", DevPujaController.findDevPujabyTitleOrSubtitle);

module.exports = route;
