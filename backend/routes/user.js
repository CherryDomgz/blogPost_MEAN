const express = require("express");

const UserController = require("../controllers/user");//import to controller

const router = express.Router();

router.post("/signup", UserController.createUser);

router.post("/login", UserController.userLogin);

module.exports = router;
