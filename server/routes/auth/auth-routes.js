const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  forgotPassword,
  resetPassword,  // Add resetPassword controller here
  getAllUsers, 
} = require("../../controllers/auth/auth-controller");



const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user,
  });
});

// Add the forgot password route
router.post("/forgotpassword", forgotPassword);

// Add the reset password route
router.post("/resetpassword", resetPassword);

router.get("/users", getAllUsers);

module.exports = router;
