var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).send("Welcome to Pokedex");
});

router.use((req,res,next)=>{
    const exception = new Error(`Path not found`);
    exception.statusCode = 404;
    next(exception)
})

router.use((err,req,res,next)=>{
    res.status(err.statusCode).send(err.message)
})

module.exports = router;
