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


//trucks: 6,7,8
//cust: 9,10,11
var trucksObject = {
    "customer_id": 10,
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

var customersAll = {
    "success": true,
    "customers": [
    {
    "id": 9,
    "first_name": "A",
    "last_name": "B",
    "email": "a@a.com",
    "role": "Role.customer",
    "created_time": null,
    "served_by_id": null
    },
    {
    "id": 10,
    "first_name": "C",
    "last_name": "D",
    "email": "b@b.com",
    "role": "Role.customer",
    "created_time": null,
    "served_by_id": 6
    },
    {
    "id": 11,
    "first_name": "E",
    "last_name": "F",
    "email": "c@c.com",
    "role": "Role.customer",
    "created_time": null,
    "served_by_id": null
    }
    ]
    };

customerHandler.route("/updateCoordinate/")
.post((req, res, next)=>{
    console.log("/customer/updateCoordinate" +"  post request rcvd");
    //console.log('req\n', req);
    console.log('req.body:\n', req.body);
    res.end(JSON.stringify(req.body));
});

customerHandler.route("/getTrucks/")
.post((req,res,next)=>{
    console.log("/customer/getTrucks" +"  post request rcvd");
    
    console.log('req.body:\n', req.body);
    console.log('response being sent is\n', JSON.stringify(trucksObject));
    res.end(JSON.stringify(trucksObject));
});

customerHandler.route("/all/")
.post((req, res, next)=>{
    console.log('\ncustomer/all/ post req rcvd');
    console.log('req.body:\n', req.body);
    console.log('RESPONSE being sent', JSON.stringify(customersAll));
    res.end(JSON.stringify(customersAll));
});

module.exports = customerHandler;