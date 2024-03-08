const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "iamjaat";

//ROUTE 1:  Create a user using POST : "/api/auth/signup"

router.post(
  "/signup",
  [
    body("name", "Plese Enter atleast 1 length name").isLength({ min: 1 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Required  minimum 4 length password").isLength({
      min: 4,
    }),
  ],
  async (req, res) => {
    // check the input data is valid or not
    let signup = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    try {
      // Check if user with this email is already or not
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ error: "user already exists" });
      }
      // Converting our password to hash and add salt
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(req.body.password, salt);

      // Save user details to database
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
      });

      // send user id for generate a token
      const data = {
        user: { id: user.id },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({ signup: "true", Token: authToken });
    } catch (error) {
      res.status(500).json({ signup, error });
    }
  }
);

// ROUTE 2 : Authenticate a user using POST : "/api/auth/login"

router.post(
  "/login",
  [body("email", "Enter a valid email").isEmail()],
  async (req, res) => {
    // check the inputs is valid or not
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    // check user is already registerd or not
    const { email, password } = req.body;
    try {
      // match user entered email with data base emails
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "Plzz enter correct details" });
      }
      // match user entered password with stored password.
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(404)
          .json({ success: false, error: "Plzz enter correct details" });
      }

      // if email password match true then send a token to user by using id
      const data = {
        user: { id: user.id },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({ success: true, msg: "login Successfull", token: authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: "some error occured" });
    }
  }
);

// ROUTE 3 : Get Loggedin user details using POST : "/api/auth/getuser"

router.get("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "some error occured" });
  }
});

module.exports = router;
