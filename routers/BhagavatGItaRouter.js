const express = require("express");
const route = express.Router();
const BhagavatGitaController = require("../controllers/BhagavatGitaController");
const { protect, isAdminOrSuperAdmin } = require("../middelwares/adminAuth");

route.post(
  "/create",
  protect,
  isAdminOrSuperAdmin,
  BhagavatGitaController.createBhagavatGita
);
route.get(
  "/read",
  protect,
  isAdminOrSuperAdmin,
  BhagavatGitaController.getAllBhagavatGita
);
route.put(
  "/update/:id",
  protect,
  isAdminOrSuperAdmin,
  BhagavatGitaController.updateBhagavatGita
);
route.delete(
  "/delete/:id",
  protect,
  isAdminOrSuperAdmin,
  BhagavatGitaController.deleteBhagavatGita
);
route.get("/find", BhagavatGitaController.findBhagavatGitabyTitleOrSubtitle);

module.exports = route;
