var express = require('express');
const allCustomersHandler = express.Router();
var cors = require('cors');
const morgan = require('morgan');
const bodyparser = require('body-parser');
var app = express();
app.use(cors());
allCustomersHandler.use(morgan('dev')); 
allCustomersHandler.use(bodyparser.urlencoded());
allCustomersHandler.use(cors());
var baseUrl = "http://localhost:8080";


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

   allCustomersHandler.route("/all/")
   .post((req, res, next)=>{
        console.log('\ncustomers/all/ post req rcvd');
        console.log('req.body:\n', req.body);
        console.log("==============================================");
        console.log('RESPONSE being sent', JSON.stringify(customersAll));
        res.end(JSON.stringify(customersAll));
    });
    
    module.exports = allCustomersHandler; 