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
  mapObjectTruck: google.maps.Map;
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
  destinationMarkerObject : google.maps.Marker;
  destinationInfoWindow: google.maps.InfoWindow;
  listOfCustomerMarkers : google.maps.Marker[] = [];
  refreshInterval : number = 60000; //mill second interval to refresh truck's and customers locations on map.
  currentServingBatchOfCustomers : Map<Number, google.maps.Marker>;
  

  constructor(private backendServer : BackendServerDataFetchingServiceService,
    private actvdRoute : ActivatedRoute, router : Router
    ) {
    this.currentServingBatchOfCustomers = new Map<Number, google.maps.Marker>();
   }

  ngOnInit() {

    if(this.actvdRoute.snapshot.queryParamMap.has("userId")==true){
      console.log('userId=', this.actvdRoute.snapshot.queryParamMap.get("userId"));
      this.truck_id = Number(this.actvdRoute.snapshot.queryParamMap.get("userId"));
    }
    var mapPropObjectTruck = {
      // center: new google.maps.LatLng(43.0417898, -76.1228379),
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
       if(this.destinationMarkerObject!=undefined && this.destinationMarkerObject!=null){
         alert("You have already chosen your destination!");
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
          this.destinationInfoWindow.open(this.mapObjectTruck, this.destinationMarkerObject);

         this.destination = Promise.resolve({"destination_latitude" : event.latLng.lat, "destination_longitude" : event.latLng.lng});
       }
     })

    
     this.updateCoordinatesToServerAndUpdateMapWithNearByCustomers();
     this.updateAgainNearByCustomers(); 
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
          console.log('near by customerData returned by the server\n', customerData);
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
        
        this.infoWindowObjectTruck.setContent('You are here!');
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

  //give the data of nearBycustomersArray it shall update the map.
  updateTruckMapWithNearByCustomers = (nearByCustomerData : any)=>{
    
      try{
        this.listOfCustomerMarkers=[];
      //evaluate to see if the query was success.
        for(let each of nearByCustomerData.customers){
          if(this.mapFindHelper(each.user_id_id)==true){
            console.log('mapFindHelper returned true for: ', each.user_id_id);
            continue;
          }
            
          let customerMarker = new google.maps.Marker({
            'position' : new google.maps.LatLng(each.latitude, each.longitude),
            'map' : this.mapObjectTruck,
            'title' : "Customer",
            'label' : String(each.user_id_id)
          });
          this.listOfCustomerMarkers.push(customerMarker);

          customerMarker.addListener('dblclick', (event)=>{
            console.log('dbl click event generated by clicking customer marker\n', event);
            this.currentServingBatchOfCustomers.set(Number(customerMarker.getLabel()), customerMarker);
            customerMarkerInfoWindow.open(this.mapObjectTruck,customerMarker);
          });
          
          let customerMarkerInfoWindow : google.maps.InfoWindow = new google.maps.InfoWindow({
            'content' : "customer selected"  
          });
          customerMarker.addListener("click", ()=>{
            console.log('click event generated for customedrMarker: ', customerMarker.getLabel());
            if(this.mapFindHelper(Number(customerMarker.getLabel()))===true){
              console.log('click event: mapfindhelper result true');
              customerMarkerInfoWindow.setContent("Customer Selected");
              customerMarkerInfoWindow.open(this.mapObjectTruck, customerMarker);
            }else{
              console.log('click event: mapfinder result false');
              customerMarkerInfoWindow.setContent("Not yet Selected");
              customerMarkerInfoWindow.open(this.mapObjectTruck, customerMarker);
            }
          });
          customerMarkerInfoWindow.addListener('closeclick', (event)=>{
            console.log('closeclick event of customerMarkerInfoWindow generated:\n', event);
          })
          
          
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

  startJourney = ()=>{
    if(this.destinationMarkerObject!=undefined && this.destinationMarkerObject!=null){
      //send serving customers to the server.
      //update the truck posn in map as well as server in real time till journey done.
      //think about what all parameters to be re/set.
      console.log(this.currentServingBatchOfCustomers.size);
      this.sendCustomers();
    }else{
      console.log("inside else of startJourney:", this.currentServingBatchOfCustomers.size);
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

  endJourney(){
    
  }

  getCustomerBookingRequests = ()=>{

  }

}
