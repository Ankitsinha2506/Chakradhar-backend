const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserAppControllers");
const { protect, isAdminOrSuperAdmin } = require("../middelwares/adminAuth");

router.post("/signup", userController.signUp);
router.put("/editprofile", userController.updateUserProfile);
router.post("/updatePassword", userController.updatePassword);
router.post("/sendOtp", userController.sendOtp);
router.post('/send-otp', userController.sendphoneOtp);
router.post('/verify-otp', userController.verifyphoneOtp);
router.post("/login", userController.loginUser);
router.post("/create", protect, isAdminOrSuperAdmin, userController.createUser);
router.post("/createAdminUser", protect, isAdminOrSuperAdmin, userController.adminCreateUser);
router.get("/get", protect, isAdminOrSuperAdmin, userController.getUser);

router.put(
  "/update/:email",
  protect,
  isAdminOrSuperAdmin,
  userController.updateUser
);
router.delete(
  "/delete/:email",
  protect,
  isAdminOrSuperAdmin,
  userController.deleteUser
);
router.get("/mainTitle", userController.findbyMainTitle);

router.get("/parayanInfoTitle", userController.findParayanInfoTitles);
router.get("/aartiInfoTile", userController.findAartiSangrahInfoTitles);
router.get("/bhajanInfoTile", userController.findBhaganSangrahInfoTitles);
router.get(
  "/parayanSubInfoTitle/:infoTitle",
  userController.findParayanSubinfoTitles
);
router.get(
  "/get-parayancontent/:subInfoTitle",
  userController.findParayanContentBySubInfoTitle
);
router.get(
  "/bhajanSubInfoTitle/:infoTitle",
  userController.findBhajanSubinfoTitles
);
router.get(
  "/get-bhajancontent/:subInfoTitle",
  userController.findBhajanContentBySubInfoTitle
);
router.get(
  "/aartiSubInfoTitle/:infoTitle",
  userController.findAartiSubinfoTitles
);
router.get(
  "/get-aarticontent/:subInfoTitle",
  userController.findAartiContentBySubInfoTitle
);
router.get("/bhagvatGitaSubTitle", userController.findBhagavatGitaSubTitles);
router.get(
  "/get-bhagvatGitacontent/:subtitle",
  userController.findBhagvatGitaContentBySubTitle
);
router.get("/DevPoojaSubTitle", userController.findDevPoojaSubTitles);
router.get(
  "/get-DevPoojacontent/:subtitle",
  userController.findDevPoojaContentBySubTitle
);
router.get("/PanchaKrushnaSubTitle", userController.findPanchaKrushnaSubTitles);
router.get(
  "/get-PanchaKrushnaContent/:subtitle",
  userController.findPanchaKrushnaContentBySubtitle
);

module.exports = router;
