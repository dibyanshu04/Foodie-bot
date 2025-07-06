const {default: mongoose} = require('mongoose');
const Reservation = require('../models/reservation');

//create reservation, view All Reservation, view reservation by Id
const addReservation = async(req,res) =>{};
const viewReservation = async(req,res) =>{};
const viewReservationById = async(req,res) =>{};
const updateReservation=async(req,res)=>{};
const deleteReservation = async(req,res)=>{};

module.exports = {
    addReservation,
    viewReservation,
    viewReservationById,
    updateReservation,
    deleteReservation
};
