import { Component, OnInit, ViewChild } from '@angular/core';
import {} from '@types/googlemaps';
import { customer } from '../schema';
import {BackendServerDataFetchingServiceService} from '../backend-server-data-fetching-service.service';


@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {
  @ViewChild('gmapcustomer') gmapElem: any;
  mapObject: google.maps.Map;
  infoWindowObject : google.maps.InfoWindow = new google.maps.InfoWindow;
  markerObject : google.maps.Marker;
  customerObject : customer;
  bookedTruck : boolean = false;
  bookedTruckId : Number;
  hashMapOfTruckMarkers : Map<google.maps.Marker, Number>;
  
  constructor(private backendServer : BackendServerDataFetchingServiceService) { 
    this.hashMapOfTruckMarkers = new Map();
  }

  ngOnInit() {
    var mapPropObject = {
     // center: new google.maps.LatLng(43.0417898, -76.1228379),
     center: new google.maps.LatLng(35, -76.1228379),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.mapObject = new google.maps.Map(this.gmapElem.nativeElement, mapPropObject);
    this.markerObject = new google.maps.Marker({
      position : new google.maps.LatLng(35, -76.1228379),
      map: this.mapObject,
      title: 'this is a marker'
    });
    
    // this.markerObject.addListener('click', (data)=>{
    //   console.log('marker click event generated with data\n', data.latLng.lat());
    //   //here ask the customer if he wants to book with that truck and then 
    //   //1.set the bookedtruck to true to prevent any further getNearByTrucks polling.
    //   //2.send the server that this truck is being booked by the customer.
    //   //3.next constantly poll to see if that truck has acknowledged.
    //   this.bookedTruck = true;
    // });
    console.log(this);
    //this function continuously updates the browser location.
    this.updateCoordinates();
    
  }

   handleLocationError(browserHasGeolocation : boolean, infoWindow : google.maps.InfoWindow , 
    pos : google.maps.LatLng) {
      infoWindow.setPosition(pos);
      infoWindow.setContent(browserHasGeolocation ?
                            'Error: The Geolocation service failed.' :
                            'Error: Your browser doesn\'t support geolocation.');
      infoWindow.open(this.mapObject);
  }

  updateCoordinates  = ()=>{
    console.log(this);
    if(this.bookedTruck)
    return;
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position)=>{
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.infoWindowObject.setPosition(pos);
        this.infoWindowObject.setContent('You are here!');
        this.infoWindowObject.open(this.mapObject);
        this.mapObject.setCenter(pos);
        this.markerObject.setPosition(pos);
        this.customerObject = new customer(123, pos.lat, pos.lng)
        var truckQueryPromise : Promise<any>;
        
        //update the backend server with customer positon. Based on that query nearBytrucks.
        var posUpdatePromise = this.backendServer.updateCoordinatesForCustomer(this.customerObject)
        .toPromise<customer>();
        posUpdatePromise.then((data)=>{
          console.log('response rcvd from the updateCoordinatesForCustomer\n', data);
          truckQueryPromise = this.backendServer.getNearByTrucks(this.customerObject)
          .toPromise<any>();
          truckQueryPromise.then((data)=>{
            console.log('response rcvd from the getNearByTrucks function\n', data);
            //first check if the bookedtruck is false so as to proceed. as there can be 
            //an old settimeout request in the callback queue.
            //create markers for each of those trucks, persist in a hashmap<marker>
            //so that when a marker is clicked for booking it can be searched for.
            if(!this.bookedTruck){
              for(let each of data.trucks){
                console.log('each truck\n', each);
                let truckMarker = new google.maps.Marker({
                  'position' : new google.maps.LatLng(each.latitude, each.longitude),
                  'map' : this.mapObject,
                  'title' : "Truck",
                  'label' : String(each.user_id_id)
                });
                
                //can also register for single click function if needed.

                //dblclick event is to book an ice cream truck.
                google.maps.event.addListener(truckMarker, "dblclick", (truckToBeBooked)=>{
                  console.log('dbl click event generated from truckmarker\n', truckMarker);
                  console.log('truckMarker.label ', truckMarker.getLabel());
                  this.bookedTruckId = Number(truckMarker.getLabel());
                  this.bookedTruck = true;
                  //here call bookTruckById({truckid, customerid});

                })
                
              }
              
              
            }else{
              this.hashMapOfTruckMarkers = new Map();
            }
            if(!this.bookedTruck){
              setTimeout(this.updateCoordinates, 15000);
              console.log('line after setTimeOut in updatecoordinates');
              
            }else{
              this.hashMapOfTruckMarkers = new Map();
            }
          })
          .catch((err)=>{
            console.log('some error from the getNearByTrucks\n', err);
          });
        })
        .catch((err)=>{
          console.log('some error from the updateCoordinatesForCustomer\n', err);
          truckQueryPromise = this.backendServer.getNearByTrucks(this.customerObject)
          .toPromise<any>();
          truckQueryPromise.then((data)=>{
            console.log('response rcvd from the getNearByTrucks function\n', data);
            setTimeout(this.updateCoordinates, 15000);
            console.log('line after setTimeOut in updatecoordinates');
          })
          .catch((err)=>{
            console.log('some error from the getNearByTrucks\n', err);
          });
        });
        
        
      }, ()=>{
        this.handleLocationError(true, this.infoWindowObject, this.mapObject.getCenter());
      });
    }else{
      //browser doesnt support geolocation
      this.handleLocationError(false, this.infoWindowObject, this.mapObject.getCenter());
    }
  }

  pollForBookedTruckAcknowledgement = ()=>{
    
  }

  
}
