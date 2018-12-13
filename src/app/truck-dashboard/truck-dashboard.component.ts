////////////////////////////////////////////////////////////////////////
//Package: Truck-Dashboard
//Author: Lakshmi kanth sandra
//Version: v2.0
//Development Environment: Toshiba Satellite Windows
////////////////////////////////////////////////////////////////////////
//Required Files:
//===============
//backend-server-data-fetching-service.service.TS
//schema.TS
//----------------------------------------------------------------------
//Operations:
//===========
//This package deals solely with the truck dashboard functionalities:
//----------------------------------------------------------------------
//Public interface:
//=================
//class TruckDashboardComponent: this class is the primary interface
//which encapsulates all the data and methods.
//constructor() : takes backendServer dependency injection service and 
//ativate route as parameters.
//refreshInterval : interval time for the polling.
//ngOnInit() : initializes the google maps and sets the callbacks necessary.
//updateCoordinatesWhileIdle() : this function expression updates the truck'
//map with its coordinates in real time. returns truck object.
//updateTruckMapWithNearByCustomers() : This function expression updates the
//truck's map with near by customers in real time as obtained from the servr
//updateCoordinatesToServerAndUpdateMapWithNearByCustomers() :
//this function expression aggregates the above two functions and is the 
//primary entry point.
//updateAgainNearByCustomers(): 
//this function expression executes the updateCoordinatesToServerAndUpdate-
//MapWithNearByCustomers function with refreshInterval frequency.
//mapFindHelper() : helper function to search in currentServingBatch
//mapFindHelper2() : helper function to search in customerRequests.
//getCustomerBookingRequests() : this function expression queries for
//customer requests from the backend server.
//getCustomerBookingRequestsInRealTime() : does polling for refreshInterval
//frequency and utlizes getCustomerBookingRequests function.
//startJourney() : this function is evoked when the truck driver decides to
//start the journey.
//sendCustomers() : this function updates the backend server with the custo-
//mers that are about to be served by this truck.
//endJourney() : this function expression is evoked when all the customers are
//served by the truck and generates completed journey event.
//////////////////////////////////////////////////////////////////////////////


import { Component, OnInit, ViewChild } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router'
import {} from '@types/googlemaps';
import { customer, truck } from '../schema';
import {BackendServerDataFetchingServiceService} from '../backend-server-data-fetching-service.service';
import { nextTick } from 'q';

@Component({
  selector: 'app-truck-dashboard',
  templateUrl: './truck-dashboard.component.html',
  styleUrls: ['./truck-dashboard.component.css']
})
export class TruckDashboardComponent implements OnInit {

  @ViewChild('gmaptruck') gmapElement: any;
  mapObjectTruck: google.maps.Map; //prime google map for this truck.
  infoWindowObjectTruck : google.maps.InfoWindow = new google.maps.InfoWindow;
  markerObjectTruck : google.maps.Marker;
  truckObject : Promise<truck>;
  truckObjectResolved : truck;
  truck_id : Number; 
  onMove : boolean = false;
  destination : Promise<{
    destination_latitude: Number,
    destination_longitude: Number;
  }>;
  destinationMarkerObject : google.maps.Marker; //destination selected by the truck
  destinationInfoWindow: google.maps.InfoWindow;
  //will have all nearby customers but those already present in currentServingBatch and customerRequests.
  listOfCustomerMarkers : google.maps.Marker[] = [];
  refreshInterval : number = 60000; //mill second interval to refresh truck's and customers locations on map.
  //Those acknowledged by the truck. wont be able to acknowldge whle moving.
  currentServingBatchOfCustomers : Map<Number, google.maps.Marker>;
  //customers who requested this particular truck.
  customerRequests : Map<Number, google.maps.Marker>;

  constructor(private backendServer : BackendServerDataFetchingServiceService,
    private actvdRoute : ActivatedRoute, router : Router
    ) {
    this.currentServingBatchOfCustomers = new Map<Number, google.maps.Marker>();
    this.customerRequests = new Map<Number, google.maps.Marker>();
   }

  ngOnInit() {

    if(this.actvdRoute.snapshot.queryParamMap.has("userId")==true){
      console.log('userId=', this.actvdRoute.snapshot.queryParamMap.get("userId"));
      this.truck_id = Number(this.actvdRoute.snapshot.queryParamMap.get("userId"));
    }
    var mapPropObjectTruck = {
      
       center: new google.maps.LatLng(35, -76.1228379),
      
       zoom: 15,
       mapTypeId: google.maps.MapTypeId.ROADMAP
     };
     this.mapObjectTruck = new google.maps.Map(this.gmapElement.nativeElement, mapPropObjectTruck);
     this.markerObjectTruck = new google.maps.Marker({
       position : new google.maps.LatLng(35, -76.1228379),
       map: this.mapObjectTruck,
       title: 'My Truck: ' + String(this.truck_id)
     });
    

     this.mapObjectTruck.addListener('click', (event)=>{
       console.log('click event triggered with data:\n', event.latLng);
        this.mapObjectTruck.setCenter(event.latLng);
     });

     this.mapObjectTruck.addListener('rightclick', (event)=>{
       console.log('rightclick event generated:\n', event);
       if(this.destinationMarkerObject!==undefined && this.destinationMarkerObject!==null){
         alert("You have already chosen your destination!");
        console.log('destinationMarkerObject:\n', this.destinationMarkerObject);
        console.log('destinationInfowWindow: \n', this.destinationInfoWindow); 
         return;
       }else if(this.currentServingBatchOfCustomers.size<=0){
         alert('No customers acknowledged yet. Acknowledge customer by double clicking');
         console.log('attempt to choose destination while currentServingBatch empty');
         return;
       }
       if(confirm(`confirm   ${event.latLng} \nas your new destination?`)){
          this.destinationMarkerObject = new google.maps.Marker({
            map : this.mapObjectTruck,
            position : event.latLng,
            title : "Destination"
          });
          this.destinationInfoWindow = new google.maps.InfoWindow({
            "content" : "Truck destination"
          });

          this.destinationMarkerObject.addListener('click', ()=>{
            console.log('click event generated for destinationMarker');
            this.destinationInfoWindow.open(this.mapObjectTruck, this.destinationMarkerObject);
          })
          this.destinationInfoWindow.open(this.mapObjectTruck, this.destinationMarkerObject);

         this.destination = Promise.resolve({"destination_latitude" : event.latLng.lat, "destination_longitude" : event.latLng.lng});
       }
     })

    
     this.updateCoordinatesToServerAndUpdateMapWithNearByCustomers();
     this.updateAgainNearByCustomers(); 
     this.getCustomerBookingRequestsInRealTime();
  };

  

  updateCoordinatesToServerAndUpdateMapWithNearByCustomers = ()=>{
    console.log('this object in updateCoordinatesToServerAndUpdateMapWithNearByCustomers\n', this);
    this.truckObject = this.updateCoordinatesWhileIdle();
    this.truckObject.then((truckOb)=>{
      console.log('updateCoordinatesToServerAndUpdateMapWithNearByCustomers: truckOb\n', truckOb);
      var t1 = this.backendServer.updateCoordinatesForTruck(truckOb).toPromise();
      //after successful updation of coordinates to the server.
      t1.then(()=>{
        this.backendServer.getNearByCustomers(<truck>truckOb).toPromise()
        .then((customerData)=>{
          //after nearby customers have been obtained from server
          console.log('near by customerData returned by the server\n', customerData);
          //updating the map with nearby customers.
          this.updateTruckMapWithNearByCustomers(customerData);
          
        })
        .catch((err)=>{
          console.log('some error occured while attempting to fetch nearby customers from server\n',err);
        })
      })
      .catch((err)=>{
        console.log('some error occurred while attempting to update server with the truck coordinates\n', err);

      })
    }).catch((err)=>{
      console.log('truckDashBoard: some error occurred while attempting to fetch the truck coordinates from navigator\n', err);

    })
  }
  
    //obtains current gps position and updats the map with it as center.
   updateCoordinatesWhileIdle = () : Promise<any>=>{
    return new Promise((resolve, reject)=>{
        if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position)=>{
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        this.infoWindowObjectTruck.setContent('Your Truck is here!');
        this.infoWindowObjectTruck.open(this.mapObjectTruck, this.markerObjectTruck);
        this.mapObjectTruck.setCenter(pos);
        this.markerObjectTruck.setPosition(pos);
        var temptruckObject = new truck(this.truck_id, pos.lat, pos.lng);
        console.log('updatecoordinateswhileidle: temptruckobject \n', temptruckObject);
        resolve(temptruckObject);
        
      })
    }else{
      reject(new Error("some error in fecthing the navigator position"));
    }
    })
  }

  //given the data of nearBycustomersArray it shall update the map.
  //makes sure the previous customerRequests and currentServingBatch markers are not recreated.
  updateTruckMapWithNearByCustomers = (nearByCustomerData : any)=>{
    
      try{

        for(let eachCust of this.listOfCustomerMarkers){
          
            eachCust.setMap(null);
        }
        this.listOfCustomerMarkers=[];
      
        for(let each of nearByCustomerData.customers){
          if(this.mapFindHelper(each.user_id_id)==true){
            console.log('mapFindHelper returned true for: ', each.user_id_id);
            console.log(each.user_id_id, ': marker exists already in currentServing');
            continue;
          }else if(this.mapFIndHelper2(each.user_id_id)==true){
            console.log('mapFindHelper2 reurned true for: ', each.user_id_id);
            console.log(each.user_id_id, ': marker exists already in customerRequests');
            continue;
          }
            
          let customerMarker = new google.maps.Marker({
            'position' : new google.maps.LatLng(each.latitude, each.longitude),
            'map' : this.mapObjectTruck,
            'title' : "Customer",
            'label' : String(each.user_id_id)
          });
          this.listOfCustomerMarkers.push(customerMarker);

          
          
          
        }
      }catch(err){
        console.log('some error while updating the map with customer markers\n', err);
      }
      
    
  }

  //fetch position and nearBycustomers aftter every few minutes.
  updateAgainNearByCustomers = ()=>{
    setInterval(this.updateCoordinatesToServerAndUpdateMapWithNearByCustomers, this.refreshInterval);
  }

  mapFindHelper(customer_id : Number ) : boolean{

    let temp = this.currentServingBatchOfCustomers.get(customer_id);
    if(temp!==undefined && temp!==null)
       return true;
    return false;   
  }

  mapFIndHelper2(customer_id : Number) : boolean{
    let temp = this.customerRequests.get(customer_id);
    if(temp!==undefined && temp!==null)
      return true;
    return false;
  }

  

  startJourney = ()=>{
    if(this.destinationMarkerObject!=undefined && this.destinationMarkerObject!=null){
      
      console.log('currentServingBatch size: ', this.currentServingBatchOfCustomers.size);
      this.onMove = true;
      this.sendCustomers();
    }else{
      console.log("inside else of startJourney:", this.currentServingBatchOfCustomers.size);
      alert("Please select the destination before starting the journey");      
    }
  }

  sendCustomers(){
    let func = function logMapElements(value, key, map) {
      console.log("key: ", key);
      temp.push(<Number>key);
    };
    let temp : Number[] = [];
    this.currentServingBatchOfCustomers.forEach(func);
    var result = this.backendServer.sendCustomers(temp, this.truck_id).toPromise();
    
    
  }

  endJourney = ()=>{
    if(!this.onMove){
      alert("There is no Trip currently");
      return;
    }
    console.log('end of journey being notified to the server');
    this.backendServer.sendReachedDestinationSignalToServer(this.truck_id)
    .toPromise()
    .then((data)=>{
      this.onMove = false;
      let func = function logMapElements(value, key, map) {
        value.setMap(null);
        
      };
      
      this.currentServingBatchOfCustomers.forEach(func);
      console.log('endJourney: clearing currentServingBatchOfCustomers');
      this.currentServingBatchOfCustomers.clear();
      this.destinationMarkerObject.setMap(null);
      this.destinationMarkerObject = null;
      this.destination = null;
    })
  }

  //moves the marker from listofcustomerMarkers to customerRequests when there is 
  //a request from the customer for this truck. In addition to that a double click event for
  //customer acknowledgement is registered. 
  getCustomerBookingRequests = ()=>{
    console.log('getCustomerBookingRequests callback');
    this.backendServer.getCustomerBookingRequests(this.truck_id).toPromise()
    .then((custReqs)=>{
      //after successful obtaining of customer requests from the server
      console.log('custReqs rcvd: ', custReqs);
      for(let eachCust of custReqs.customers ){
        if(!this.mapFIndHelper2(eachCust.user_id_id) && !this.mapFindHelper(eachCust.user_id_id)){
          let nearByCustMarker = this.listOfCustomerMarkers.find(function(nearByCust : any) : any{
            return Number(nearByCust.getLabel())==Number(eachCust.user_id_id);
          });

          if(nearByCustMarker!==undefined){
            
            console.log('moving the marker from listOfCustomers to customerRequest: ', nearByCustMarker.getLabel());
             this.customerRequests.set(Number(nearByCustMarker.getLabel()), nearByCustMarker);
             this.listOfCustomerMarkers.splice(this.listOfCustomerMarkers.indexOf(nearByCustMarker), 1);
             let nearByCustomerMarkerInfoWindow : google.maps.InfoWindow = new google.maps.InfoWindow({
              'content' : "customer Requested"  
            });
            nearByCustomerMarkerInfoWindow.open(this.mapObjectTruck,nearByCustMarker);
          let nearByDblclickEventListnr =  nearByCustMarker.addListener('dblclick', (event)=>{
              if(this.onMove==true){
                console.log('cant acknowledge while currently serving');
                return;
              }else{
                console.log('moving marker from customerRequests to currentServing');
                //fetch the marker from customerRequests.
                let ackdCustMarker = this.customerRequests.get(Number(nearByCustMarker.getLabel()));
                
                let ackdCustMarkerInfoWindow : google.maps.InfoWindow = new google.maps.InfoWindow({
                  'content' : "customer Acknowledged"  
                });
                ackdCustMarkerInfoWindow.open(this.mapObjectTruck, ackdCustMarker);
                //push the marker into the currentSrvingBatch.
                this.currentServingBatchOfCustomers.set(Number(ackdCustMarker.getLabel()), ackdCustMarker);
                //removing the marker from customerRequests
                this.customerRequests.delete(Number(ackdCustMarker.getLabel()));
                //remove the double click event listener for ackdCustomer to prevent redundant selctions.
                ackdCustMarker.addListener('dblclick', (event)=>{
                  console.log('dblclick event genearted in ackdCustMarker for: ', ackdCustMarker.getLabel());
                  alert('CUSTOMER: '+ ackdCustMarker.getLabel() + ' already acknowledged');
                });
                console.log('removing the dblclick event listener for nearByCustmarker: ', nearByCustMarker.getLabel());
                //deregister the event listener to prevent second time acknowledgement.
                google.maps.event.removeListener(nearByDblclickEventListnr);
                
              }
              
          
            });

            //eventListener to show the status of customer
            nearByCustMarker.addListener('click', (event)=>{
              console.log('click event generated for marker: ', nearByCustMarker.getLabel());
              let ackdCustMarkerInfoWindow : google.maps.InfoWindow = new google.maps.InfoWindow({
                'content' : "customer Acknowledged"  
              });
              if(this.mapFindHelper(Number(nearByCustMarker.getLabel()))){
                ackdCustMarkerInfoWindow.open(this.mapObjectTruck, nearByCustMarker);
              }else if(this.mapFIndHelper2(Number(nearByCustMarker.getLabel()))){
                ackdCustMarkerInfoWindow.setContent('customer Requested');
                ackdCustMarkerInfoWindow.open(this.mapObjectTruck, nearByCustMarker);
              }
              
            })
            continue;
            
          }else{
            console.log('getCustBookingRequest: this marker not present in any three stores: ', eachCust.user_id_id);
          }


          



        }else{
          console.log('getCustomerBookingReq: this cust already present in custReq or currentServ: ', eachCust.user_id_id);
        }
      }
    })
  }

  getCustomerBookingRequestsInRealTime = ()=>{
    setInterval(this.getCustomerBookingRequests, this.refreshInterval);
  }

  onLogout(){
    console.log('Truck: redirecting the user to the backend server for logging out');
    
    this.backendServer.logOutUser(null);
  }

}
