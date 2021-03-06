var express = require('express');
const truckHandler = express.Router();
var cors = require('cors');
const morgan = require('morgan');
const bodyparser = require('body-parser');

var app = express();
app.use(cors());
truckHandler.use(morgan('dev')); 
truckHandler.use(bodyparser.urlencoded());
truckHandler.use(cors());
var baseUrl = "http://localhost:8080";
app.use(bodyparser.json());
//trucks: 6,7,8
//cust: 9,10,11
var customersObject = {
    "truck_id": 6,
    "latitude": 43.0391539,
    "longitude": -76.1438692,
    "success": true,
    "customers": [
        {
        "user_id_id": 9,
        "latitude": 43.0482894,
        "longitude": -76.1203977,
        "destination_latitude": null,
        "destination_longitude": null
        
        },
        

        {
            "user_id_id": 10,
            "latitude": 43.043967,
            "longitude": -76.119545,
            "destination_latitude": null,
            "destination_longitude": null
            
        },
        {
            "user_id_id": 11,
            "latitude": 43.040305,
            "longitude": -76.132596,
            "destination_latitude": null,
            "destination_longitude": null
            
        }
    ]
};

var customerRequests = {
    "truck_id": 6,
    "success": true,
    "customers": [
            {
            "user_id_id": 10,
            "latitude": 43.043967,
            "longitude": -76.119545,
            "destination_latitude": null,
            "destination_longitude": null
            }
        ]
    };


truckHandler.route("/updateCoordinate/")
.post((req, res, next)=>{
    console.log("/truck/updateCoordinate" +"  post request rcvd");
    //console.log('req\n', req);
    console.log('req.body:\n', req.body);
    res.end(JSON.stringify(req.body));
});

truckHandler.route("/getCustomers/")
.post((req,res,next)=>{
    console.log("/truck/getCustomers" +"  post request rcvd");
    
    console.log('req.body:\n', req.body);
    console.log('response being sent is\n', JSON.stringify(customersObject));
    res.end(JSON.stringify(customersObject));
});

truckHandler.route("/sendCustomers/")
.post((req, res, next)=>{
    console.log('/truck/sendCustomers' + "post request rcvd");
    console.log('req.body:\n', req.body);
    let temp = [req.body, {"success" : true}];
    console.log("data sending back to truck\n", JSON.stringify(temp));
    res.end(JSON.stringify(temp));
});

truckHandler.route('/getCustomerRequests/')
.post((req, res, next)=>{
    console.log('/truck/getCustomerRequests/ POST req rcvd');
    console.log('req.body:\n', req.body);
    console.log('custRequests data being sent: ', JSON.stringify(customerRequests));
    res.end(JSON.stringify(customerRequests));
});

truckHandler.route('/reachedDestination/')
.post((req, res, next)=>{
    console.log('/truck/reachedDestination/ POST req rcvd');
    console.log('req.body:\n', req.body);
    let temp = {
        "truck_id" : req.body.truck_id,
        "success" : true
    }
    res.end(JSON.stringify(temp));
})

module.exports = truckHandler;