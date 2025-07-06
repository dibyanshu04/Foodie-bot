const express = require('express');
const router = express.Router();

const {
    addReservation,
    viewReservation,
    viewReservationById,
    updateReservation,
    deleteReservation
} = require('../controllers/reservationControllers');

router.get("/view", viewReservation);
router.get("/viewById/:reservationId", viewReservationById);
router.post('/add', addReservation);
router.put('/update/:reservationId',updateReservation);
router.delete('/delete/:reservationId', deleteReservation);


module.exports = router;