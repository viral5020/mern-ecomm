const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const nodemailer = require("nodemailer");

// Register a new user
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (checkUser)
      return res.json({
        success: false,
        message: "User already exists with the same email! Please try again",
      });

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
    });

    await newUser.save();
    res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exist! Please register first",
      });

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "7d" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false }).json({
      success: true,
      message: "Logged in successfully",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

// Logout user
const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

// Auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "token not found!",
    });

  try {
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorized user!",
    });
  }
};

// Forgot password - generates reset token and sends it via email
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with that email address",
      });
    }

    // Generate password reset token
    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      "RESET_PASSWORD_SECRET_KEY",
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Store the reset token in the user model (optional)
    user.resetPasswordToken = resetToken;
    await user.save();

    // Create a transporter for sending emails
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "viralajudia123@gmail.com", // Replace with your email
        pass: "your-email-password", // Replace with your email password
      },
    });

    // Send the reset password email with the token as part of the URL
    const resetLink = `http://localhost:5173/auth/resetpassword?token=${resetToken}`;

    await transporter.sendMail({
      from: "viralajudia123@gmail.com",
      to: email,
      subject: "Password Reset Request",
      text: `
    Hello,

    We received a request to reset your password. If you made this request, please click the link below to reset your password:

    ${resetLink}

    If you did not request a password reset, please ignore this email. Your password will not be changed.

    If you need further assistance, feel free to contact our support team.

    Thank you,
    [Your Company Name]
    [Company Contact Info]
  `,
      html: `
    <p>Hello,</p>
    <p>We received a request to reset your password. If you made this request, please click the link below to reset your password:</p>
    <p><a href="${resetLink}"><b>Reset Your Password</b></a></p>
    <p>If you did not request a password reset, please ignore this email. Your password will not be changed.</p>
    <p>If you need further assistance, feel free to contact our support team.</p>
    <br />
    <p>Thank you,</p>
    <p><strong>[Your Company Name]</strong><br />
    [Company Contact Info]</p>
  `,
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email address",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Reset password - allows user to reset their password using the token
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    // Verify the reset token
    const decoded = jwt.verify(token, "RESET_PASSWORD_SECRET_KEY");

    const user = await User.findOne({ _id: decoded.id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update the user's password
    user.password = hashedPassword;
    user.resetPasswordToken = undefined; // Clear the reset token
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};


// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.status(200).json({
      success: true,
      users: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching users.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  forgotPassword,
  resetPassword,
  getAllUsers, // Export the function to fetch users
};


