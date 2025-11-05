const express = require("express");
const route = express.Router();
const ParayanController = require("../controllers/ParayanController");
const { protect, isAdminOrSuperAdmin } = require("../middelwares/adminAuth");

route.post(
  "/create",
  protect,
  isAdminOrSuperAdmin,
  ParayanController.createParayan
);
route.get(
  "/read",
  protect,
  isAdminOrSuperAdmin,
  ParayanController.getAllParayan
);
route.put(
  "/update/:id",
  protect,
  isAdminOrSuperAdmin,
  ParayanController.updateParayan
);
route.delete(
  "/delete/:id",
  protect,
  isAdminOrSuperAdmin,
  ParayanController.deleteParayan
);
route.get("/read/:id", ParayanController.getParayanById);

route.get("/find", ParayanController.findParayanbyTitleOrSubtitle);
route.head("/find", ParayanController.findParayanbyTitleOrSubtitle);

module.exports = route;
