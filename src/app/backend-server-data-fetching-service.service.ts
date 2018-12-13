////////////////////////////////////////////////////////////////////////
//Package: backend-server-data-fetching-service
//Author: Lakshmi kanth sandra
//Version: v2.0
//Development Environment: Toshiba Satellite Windows
////////////////////////////////////////////////////////////////////////
//Required Files:
//===============
//schema.TS
//----------------------------------------------------------------------
//Operations:
//===========
//This package is the interface between the backend server and the frontend.
//it acts as a dependency injection to all the components in the frontend.
//-----------------------------------------------------------------------
//Public Interface:
//=================
//class BackendServerDataFetchingServiceService: primary class which is the
//interface for dependencies.
//updateCoordinatesForTruck() : updates the truck's coordinates to backend
//updateCoordinatesForCustomer() : updates the customer's coordinates to 
//backend.
//getNearByTrucks() : queries nearby trucks for a given customer.
//bookTruckById() : customer books for this truck_id
//getNearByCustomers() : queries the backend for near by customers.
//sendCustomers() : for a given truck sends currently serving customers 
//to the backend.
//findIfTheTruckHasAcknowledgedToServeTheCustomer() : queries the backend
//for ascertaining the acknowledgement from the truck.
//getCustomerBookingRequests() : queries the backend for customer requests
//for a given truck.
//sendReachedDestinationSignalToServer() : signals the backend server about
//the reached status.
//sendNewDestinationToServer() : sends to the backend the new destination 
//as chosen by the truck.



import { Injectable } from '@angular/core';
import { HttpClient , HttpHeaders} from '@angular/common/http';
import { of } from 'rxjs/observable/of';
import {catchError, map, tap} from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import {truck, customer} from './schema';


const httpOptions = {
  headers: new HttpHeaders({'Content-Type' : 'application/x-www-form-urlencoded'})
};

var baseUrl = "https://ice-cream-conection.herokuapp.com";
//baseUrl = "http://localhost:8080";
const customersUrl = baseUrl+"/truck/getCustomers/";
const trucksUrl = baseUrl+"/customer/getTrucks/";
const sendCustomersUrl = baseUrl+"/truck/sendCustomers/";
const truckUpdateCoordinatesUrl = baseUrl+"/truck/updateCoordinate/";
const customerUpdateCoordinatesUrl = baseUrl+"/customer/updateCoordinate/";
const newDestinationUrl = baseUrl + "/truck/newDestination/";
const reachedDestinationUrl = baseUrl+"/truck/reachedDestination/";
const getAllCustomers = baseUrl+"/customers/all/";
const getCustomerRequests = baseUrl + "/truck/getCustomerRequests/";




@Injectable()
export class BackendServerDataFetchingServiceService {

  constructor(private http: HttpClient) { }

  updateCoordinatesForTruck(truckObject : truck) : Observable<truck>{
    try{
      console.log('udpateCoordinatesForTruck attemting to post its position');
      return this.http.post<truck>(truckUpdateCoordinatesUrl, truckObject, httpOptions);
    }catch(err){
      console.log('some error occurred while attempting to update server with the truck coordinates\n', err);
    }

  };

  updateCoordinatesForCustomer(customerObject : customer) : Observable<customer>{
    console.log('updateCoordinatesForCustomer attempting to post its position');
    console.log('customerObject\n', customerObject);
    return this.http.post<customer>(customerUpdateCoordinatesUrl, customerObject, httpOptions);
  };

  getNearByTrucks(customerObject : customer) : Observable<any>{
    console.log('getNearByTrucks attempting to get nearby trucks');
    console.log('customerObject\n', customerObject);
    return this.http.post<any>(trucksUrl, customerObject, httpOptions);
  
  }

  bookTruckById(bookingInfoObject : any) : Observable<any>{
    console.log('bookTruckById attempting to book the truck with id', bookingInfoObject.truck_id);
    console.log('customerObject\n', bookingInfoObject);
    return this.http.post<any>(trucksUrl, bookingInfoObject, httpOptions);
  }

  getNearByCustomers(truckObject : truck) : Observable<any>{
    console.log('getNearByCustomers attempting to get nearby customers');
    console.log('truckOBject\n', truckObject);
    return this.http.post<any>(customersUrl, truckObject, httpOptions);
  }

  sendCustomers(customer_ids : Number[], truck_id : Number) : Observable<any>{
    console.log('sendCustomers attempting to send srving customers to the sevrer\n', customer_ids);
    let temp = {"truck_id" : truck_id, "customers" : customer_ids};
    console.log("truck_id and customer_ids combined:\n", temp);
    return this.http.post<any>(sendCustomersUrl, temp, httpOptions);
  }

  findIfTheTruckHasAcknowledgedToServeTheCustomer() : Observable<any>{
    console.log('findIfTheTruckHasAcknowledgedToServeTheCustomer executing');
    return this.http.post<any>(getAllCustomers, JSON.stringify("no need of data") ,httpOptions);
  }

  getCustomerBookingRequests(truck_id: Number) : Observable<any>{
    console.log('getCustomerBookingRequests executing with truck_id: ', truck_id);
    let tempReq = {"truck_id" : truck_id};
    return this.http.post<any>(getCustomerRequests, tempReq, httpOptions);
  }

  sendReachedDestinationSignalToServer(truck_id: Number) : Observable<any>{
    console.log('sendReachedDestinationSignalToServer executing with truck_id: ', truck_id);
    let tempReq = {"truck_id" : truck_id};
    return this.http.post<any>(reachedDestinationUrl, tempReq, httpOptions); 
  }

  sendNewDestinationToServer(destinationObj : any) : Observable<any>{
    console.log('sendNewDestinationToServer executing with destinationObj: ', destinationObj);
    return this.http.post<any>(newDestinationUrl, destinationObj, httpOptions); 
  }


}


