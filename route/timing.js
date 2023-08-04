const express = require('express');

const router = express.Router();

router.get('/timing',(req,res)=>{
    const SDate = 'May 28, 2023, 21:01:00';
    const EDate = 'May 28, 2023, 23:58:00';
    const presentDate = new Date();
    // console.log(presentDate)
    res.json({SDate:SDate, EDate:EDate, presentDate : presentDate});
})

module.exports = router;
