const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  getEmployeeProfile,
  updateEmployeeProfile,
   resetPassword,
    uploadDocument
} = require("./profile.controller");

const { protect, authorizeRoles } = require("../../middleware/auth.middleware");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Get Profile
router.get(
  "/:id",
  protect,
  authorizeRoles("ADMIN", "HR", "EMPLOYEE","MANAGER",'BDE'),
  getEmployeeProfile
);

//  Update Profile
router.put(
  "/update/:id",
  protect,
  authorizeRoles("ADMIN","HR","EMPLOYEE","MANAGER",'BDE'),
  updateEmployeeProfile
);
router.post(
  "/upload-document/:id",
  upload.single("file"),
  uploadDocument
);
router.put(
  "/reset-password/:id",
  protect,
  authorizeRoles("ADMIN", "HR","EMPLOYEE","MANAGER",'BDE'), 
  resetPassword
);
module.exports = router;