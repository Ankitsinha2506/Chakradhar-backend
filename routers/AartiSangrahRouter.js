const express = require("express");
const route = express.Router();
const AartiSangrahController = require("../controllers/AartiSangrahController");
const { protect, isAdminOrSuperAdmin } = require("../middelwares/adminAuth");

route.post(
  "/create",
  protect,
  isAdminOrSuperAdmin,
  AartiSangrahController.createAartiSangrah
);
route.get(
  "/read",
  protect,
  isAdminOrSuperAdmin,
  AartiSangrahController.getAllAartiSangrah
);
route.put(
  "/update/:id",
  protect,
  isAdminOrSuperAdmin,
  AartiSangrahController.updateAartiSangrah
);
route.delete(
  "/delete/:id",
  protect,
  isAdminOrSuperAdmin,
  AartiSangrahController.deleteAartiSangrah
);
route.get("/find", AartiSangrahController.findAartiSangrahbyTitleOrSubtitle);

module.exports = route;
