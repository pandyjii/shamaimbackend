

const express=require('express');

const router=express.Router()
    
const contactContaroller=require('../controller/CountactUs');

router.post('/contactus',contactContaroller.contacts);

exports.router=router;