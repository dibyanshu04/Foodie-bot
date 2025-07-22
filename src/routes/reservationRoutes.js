const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth");
const {
  addReservation,
  viewReservation,
  viewReservationById,
  updateReservation,
  deleteReservation,
  getMyReservations,
} = require("../controllers/reservationControllers");

router.get("/my-reservations", authenticate, getMyReservations);
router.get("/", viewReservation);
router.get("/:reservationId", viewReservationById);
router.post("/", authenticate, addReservation);
router.put("/:reservationId", updateReservation);
router.patch("/:reservationId", authenticate, updateReservation);
router.delete("/:reservationId", deleteReservation);

module.exports = router;
