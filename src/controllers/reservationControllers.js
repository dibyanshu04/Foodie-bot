const {default: mongoose} = require('mongoose');
const Reservation = require('../models/reservation');
const Restaurant = require('../models/restaurant');

//create reservation, view All Reservation, view reservation by Id
const addReservation = async(req,res) =>{
    try {
        const customerName = req.body.customerName;
        const restaurantName= req.body.restaurantName;
        const date = req.body.date;
        const time = req.body.time;
        const guests= req.body.guests;
        const specialRequest = req.body.specialRequest;
        const status = req.body.status;

        if(!customerName || !restaurantName || !date || !time || !guests){
            res.status(404).json({message: "customerName, restaurantName, date, time, guests cannot be undefined"})
        }

        const newReservation = new Reservation({
            customerName,
            restaurantName,
            date,
            time,
            guests,
            specialRequest,
            status
         });
         await newReservation.save();

         if(!newReservation){
            res.status(404).json({message: "No Reservation made!"})
         }
         return res.status(200).json({message: " Successfully made new Reservation!", newReservation})


    } catch (error){
        console.log(error)
        return res.status(500).json({message:"Failed to make reservation", error})
    }
};
const viewReservation = async(req,res) =>{
    try {
        const allReservations = await Reservation.find({});
        if(!allReservations){
            res.status(404).json({message: "No Reservations Found"})
        }else(console.log(allReservations));
        return res.status(200).json({
      message: "Reservations viewed successfully!",
      Reservation: allReservations,
    });

    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Failed to view Reservations!"})
    };
};
const viewReservationById = async(req,res) =>{
    try {
        const id = req.params.reservationId;
        console.log(id);
        const reservation = Reservation.findById(id);
        if (!reservation) {
      return res.status(404).json({ message: "Reservation not found associated with the Id" });
    }

    return res.status(200).json({
      message: "Reservation viewed by id successfully!",
      Reservation: reservation
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Failed to view reservation by id", error });
  }
};
const updateReservation=async(req,res)=>{
try {
    const id = req.params.reservationId;
    const {date,time,guests,specialRequest} = req.body;
    const updatedReservation = await Reservation.findOneAndUpdate(
        {_id:id},
        {date,time,guests,specialRequest},
        {new : true}
    );
    if(!updatedReservation){
        return res.status(404).json({message:"No updated reservations found!"})
    }
    return res.status(200).json({message:"Resevation updated successfully!", updatedReservation});

    
} catch (error) {
    
    return res.status(500).json({message:"Failed to update reservation!",error});
}
};
const deleteReservation = async(req,res)=>{
    try{
    const id = req.params.reservationId;
    const cancelReservation = await Reservation.findOneAndDelete;
    const cancelReservationById = await Reservation.findByIdAndDelete(id);
    if(!cancelReservation || !cancelReservationById){
        return res
        .status(404)
        .json({ message: "No Reservation found to be canceled!" });
    }
    return res.status(200).json({message:'Reservation canceled successfully!'})
}catch(error){
    return res.status(500).json({message:"Failed to cancel Reservation",error})
}
};


module.exports = {
    addReservation,
    viewReservation,
    viewReservationById,
    updateReservation,
    deleteReservation
};
