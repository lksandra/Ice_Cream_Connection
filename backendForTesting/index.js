//const http = require('http');
var express = require('express');
const customerHandler = express.Router();
var cors = require('cors');
const morgan = require('morgan');
const bodyparser = require('body-parser');
var app = express();
app.use(cors());

var hostname = '127.0.0.1';
var port = 8080;
var baseUrl = "http://localhost:8080";


var customerServiceHandler = require("./public/customerServer");

var servr = app.listen(port, hostname, () => {
    console.log(`Server running at `, baseUrl);
  });

  

// app.all(baseUrl+"/customer/updateCoordinate", (req, res)=>{
//     console.log("/customer/updateCoordinate" +"  post request rcvd");
//     console.log('req.body:\n', req.body);
//     res.end(JSON.stringify(req.body));});


app.use("/customer", customerServiceHandler);
