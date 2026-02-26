const express = require("express");
const router = express.Router();

const controller = require("../controllers/users.controller");
const private = require("../middlewares/private");

// Public
router.post("/", controller.createUser);          // POST /users
router.post("/login", controller.login);          // POST /users/login 

router.get("/", private.checkJWT, controller.getAllUsers);                 // GET /users
router.get("/:email", private.checkJWT, controller.getUserByEmail);        // GET /users/:email
router.put("/:email", private.checkJWT, controller.updateUserByEmail);     // PUT /users/:email
router.delete("/:email", private.checkJWT, controller.deleteUserByEmail);  // DELETE /users/:email

module.exports = router;