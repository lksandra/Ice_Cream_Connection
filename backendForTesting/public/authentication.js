var express = require('express');
const authenticationHandler = express.Router();
var cors = require('cors');
const morgan = require('morgan');
const bodyparser = require('body-parser');
var app = express();
app.use(cors());
authenticationHandler.use(morgan('dev')); 
authenticationHandler.use(bodyparser.urlencoded());
authenticationHandler.use(cors());
var baseUrl = "http://localhost:8080";

authenticationHandler.route('/login/')
.get((req, res, next)=>{
    console.log(baseUrl+'/login/'+  " GET request rcvd");
  console.log('req.body:\n', req.body);
  res.end(JSON.stringify('successfully logged out'));
});

module.exports = authenticationHandler;

