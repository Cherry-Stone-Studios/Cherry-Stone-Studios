// const { requireAdmin, requireUser } = require("./utils.cjs");
const express = require("express");
const router = express.Router();

// api

// accessing all user routes
router.use("/users", require("./users.cjs"));

// accessing all scores routes
router.use("/scores", require("./scores.cjs"));

// accessing all admin routes (only accessible as ADMIN)
router.use("/admin", require("./admin.cjs"));

module.exports = router;
