var express = require('express');
const customerHandler = express.Router();
var cors = require('cors');
const morgan = require('morgan');
const bodyparser = require('body-parser');
var app = express();
app.use(cors());
customerHandler.use(morgan('dev')); 
customerHandler.use(bodyparser.urlencoded());
customerHandler.use(cors());
var baseUrl = "http://localhost:8080";

var trucksObject = {
    "customer_id": 7,
    "latitude": 43.0391539,
    "longitude": -76.1438692,
    "success": true,
    "trucks": [
        {
        "user_id_id": 6,
        "latitude": 43.0482894,
        "longitude": -76.1203977,
        "destination_latitude": null,
        "destination_longitude": null,
        "served_by_id": null
        },
        

        {
            "user_id_id": 7,
            "latitude": 43.043967,
            "longitude": -76.119545,
            "destination_latitude": null,
            "destination_longitude": null,
            "served_by_id": null
        },
        {
            "user_id_id": 8,
            "latitude": 43.040305,
            "longitude": -76.132596,
            "destination_latitude": null,
            "destination_longitude": null,
            "served_by_id": null
        }
    ]
}

customerHandler.route("/updateCoordinate")
.post((req, res, next)=>{
    console.log("/customer/updateCoordinate" +"  post request rcvd");
    //console.log('req\n', req);
    console.log('req.body:\n', req.body);
    res.end(JSON.stringify(req.body));
});

customerHandler.route("/getTrucks")
.post((req,res,next)=>{
    console.log("/customer/getTrucks" +"  post request rcvd");
    
    console.log('req.body:\n', req.body);
    console.log('response being sent is\n', JSON.stringify(trucksObject));
    res.end(JSON.stringify(trucksObject));
})

module.exports = customerHandler;