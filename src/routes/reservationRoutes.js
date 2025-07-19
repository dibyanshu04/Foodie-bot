const express = require("express");
const router = express.Router();

const {
  addReservation,
  viewReservation,
  viewReservationById,
  updateReservation,
  deleteReservation,
} = require("../controllers/reservationControllers");

router.get("/", viewReservation);
router.get("/:reservationId", viewReservationById);
router.post("/", addReservation);
router.put("/:reservationId", updateReservation);
router.delete("/:reservationId", deleteReservation);

module.exports = router;
