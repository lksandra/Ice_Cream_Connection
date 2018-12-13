////////////////////////////////////////////////////////////////////////
//Package: customer-dashboard
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
//This package exclusively deals with the customer-dashboard component.
//Public-Interface:
//=================
//class CustomerDashboardComponent: primary class which encapsualtes all
//the data and methods for this component.
//listOfTruckMarkers: container for the nearby trucks.
//currentBookedBatchOfTrucks: container for the trucks in which the
//customer is interested.
//currentAcknowledgedBatchOfTrucks: container for the trucks that acknowledged
//serve this customer.
//refreshInterval: time interval for polling the backend server.
//ngOnInit() : initializes the google maps and sets the callbacks necessary.
//updateCoordinatesWhileIdle() : this function expression updates the customer'
//map with its coordinates in real time. returns customer object.
//updateCustomerMapWithNearByTrucks() : updates the map with nearby trucks
//for this customer.
//updateCoordinatesToServerAndUpdateMapWithNearByTrucks() : composes 
//updateCoordinatesWhileIdle and updateCustomerMapWithNearByTrucks function 
//expressions.
//updateAgainNearByTrucks() : executes updateCoordinatesToServerAndUpdateMap-
//WithNearByTrucks function expression with refreshInterval frequency.
//pollForBookedTruckAck() : this function expression polls for
//real time acknowledgement of truck with respect to this customer.
//keepPollingForTruckAcknowledgement() : executes the pollForBookedTruckAck
//in refreshInterval frequency.
//updateBookedAndAcknowledgedTrucksPosition() : updates the customer'
//google map with booked and acknowledged positions in real time.



import { Component, OnInit, ViewChild } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {} from '@types/googlemaps';
import { customer, truck } from '../schema';
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
  customerObject : Promise<customer>;
  customerObjectResolved : customer;
  customer_id : Number;
  bookedTruck : boolean = false;
  bookedTruckId : Number;
  
  listOfTruckMarkers : google.maps.Marker[] = [];
  currentBookedBatchOfTrucks : Map<Number, google.maps.Marker>;
  currentBookedBatchOfTruckInfoWindows : Map<Number, google.maps.InfoWindow>;
  currentAcknowledgedBatchOfTrucks : Map<Number, google.maps.Marker>;
  currentAcknowledgedBatchOfTruckInfoWindows : Map<Number, google.maps.InfoWindow>;

  refreshInterval : number = 30000;
  constructor(private backendServer : BackendServerDataFetchingServiceService,
    private activdRoute : ActivatedRoute, private router : Router
    ) { 
    this.currentBookedBatchOfTrucks = new Map<Number, google.maps.Marker>();
    this.currentAcknowledgedBatchOfTrucks = new Map<Number, google.maps.Marker>();
    this.currentBookedBatchOfTruckInfoWindows = new Map<Number, google.maps.InfoWindow>();
    this.currentAcknowledgedBatchOfTruckInfoWindows = new Map<Number, google.maps.InfoWindow>();
  }

  ngOnInit() {
    if(this.activdRoute.snapshot.queryParamMap.has("userId")==true){
      this.customer_id = Number(this.activdRoute.snapshot.queryParamMap.get("userId"));
    }
    var mapPropObject = {
     
     center: new google.maps.LatLng(35, -76.1228379),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.mapObject = new google.maps.Map(this.gmapElem.nativeElement, mapPropObject);
    this.markerObject = new google.maps.Marker({
      position : new google.maps.LatLng(35, -76.1228379),
      map: this.mapObject,
      title: 'CUSTOMER: '+ String(this.customer_id)
    });
    
    
    console.log(this);
    
    
    this.updateCoordinatesToServerAndUpdateMapWithNearByTrucks();
    this.updateAgainNearByTrucks();
    this.updateBookedAndAcknowledgedTrucksPositionInRealTimeContinuously();
    this.keepPollingForTruckAcknowledgement();
  }

   handleLocationError(browserHasGeolocation : boolean, infoWindow : google.maps.InfoWindow , 
    pos : google.maps.LatLng) {
      infoWindow.setPosition(pos);
      infoWindow.setContent(browserHasGeolocation ?
                            'Error: The Geolocation service failed.' :
                            'Error: Your browser doesn\'t support geolocation.');
      infoWindow.open(this.mapObject);
  }

  


  updateCoordinatesToServerAndUpdateMapWithNearByTrucks = ()=>{
    console.log('this object in updateCoordinatesToServerAndUpdateMapWithNearByTrucks\n', this);
    this.customerObject = this.updateCustomerCoordinatesWhileIdle();
    this.customerObject.then((custObj)=>{
      console.log('updateCoordinatesToServerAndUpdateMapWithNearByTrucks: custObj\n', custObj);
      this.customerObjectResolved = custObj;
      var tcus = this.backendServer.updateCoordinatesForCustomer(custObj).toPromise();
      tcus.then(()=>{
        //after successfully obtaining of the near by trucks from the server.
        this.backendServer.getNearByTrucks(custObj).toPromise()
        .then((truckData)=>{
          console.log('near by trucks data returned by the server\n', truckData);
          this.updateCustomerMapWithNearByTrucks(truckData);
        })
        .catch((err)=>{
          console.log('some error occured while fecthing nearby trucks from server\n ', err);
        })
      })
      .catch((err)=>{
        console.log('some error occured while updating customer position to the server\n', err);
      })
    })
    .catch((err)=>{
      console.log('customerDashboard: some error occured while updating the map with customer\'s position\n', err);
    })

  }


  updateCustomerCoordinatesWhileIdle = () : Promise<any>=>{
    return new Promise((resolve, reject)=>{
        if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position)=>{
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        this.infoWindowObject.setContent('You are here!');
        this.infoWindowObject.open(this.mapObject, this.markerObject);
        this.mapObject.setCenter(pos);
        this.markerObject.setPosition(pos);
        var tempCustObject = new customer(this.customer_id, pos.lat, pos.lng);
        console.log('updatecustomercoordinateswhileidle: temptruckobject\n', tempCustObject);
        resolve(tempCustObject);
        
      })
    }else{
      reject(new Error("some error in fecthing the navigator position"));
    }
    })
  }

  

  //updats the cusomer map with near by trucks and make sure there is no redundant
  //marers being created.
  updateCustomerMapWithNearByTrucks = (nearByTrucksData : any)=>{
    
    try{
      for(let eachTruck of this.listOfTruckMarkers){
        if(this.currentBookedBatchOfTrucks.get(Number(eachTruck.getLabel()))!=undefined){
            continue;
          }else if(this.currentAcknowledgedBatchOfTrucks.get(Number(eachTruck.getLabel()))!=undefined){
            continue;
          }else{
            eachTruck.setMap(null);
          }
      }
      this.listOfTruckMarkers=[];
    
      for(let each of nearByTrucksData.trucks){
        if(this.mapFindHelper(Number(each.user_id_id))==true){
          console.log('mapFinder returned true for: ', each.user_id_id);
          continue;
        }
        let truckMarker = new google.maps.Marker({
          'position' : new google.maps.LatLng(each.latitude, each.longitude),
          'map' : this.mapObject,
          'title' : "Truck",
          'label' : String(each.user_id_id)
        });
        this.listOfTruckMarkers.push(truckMarker);
        
        //event handler that enables the customer to book for a truck by double click
        truckMarker.addListener('dblclick', (event)=>{
          console.log('dbl click event generated by clicking truck marker\n', event);
          this.currentBookedBatchOfTrucks.set(Number(truckMarker.getLabel()), truckMarker);
          truckMarkerInfoWindow.open(this.mapObject,truckMarker);
          this.currentBookedBatchOfTruckInfoWindows.set(Number(truckMarker.getLabel()), truckMarkerInfoWindow)

        });
        
        let truckMarkerInfoWindow : google.maps.InfoWindow = new google.maps.InfoWindow({
          'content' : "Truck selected"  
        });
        //event handler to ascertain the status of a given truck
        truckMarker.addListener("click", ()=>{
          console.log('click event generated for truckMarker: ', truckMarker.getLabel());
          if(this.mapFindHelper2(Number(truckMarker.getLabel()))==true){
            console.log('click event: mapfindhelper2 result true');
            truckMarkerInfoWindow.setContent("Awaiting acknowledgement");
            truckMarkerInfoWindow.open(this.mapObject, truckMarker);
          }else if(this.mapFIndHelper3(Number(truckMarker.getLabel()))==true){
            console.log('click event: mapfindhelper3 result true');
            truckMarkerInfoWindow.setContent("Truck on its way!");
            truckMarkerInfoWindow.open(this.mapObject, truckMarker);
          }else{
            console.log('click event: mapfinder2&3 result false');
            truckMarkerInfoWindow.setContent("Truck Not yet Selected");
            truckMarkerInfoWindow.open(this.mapObject, truckMarker);
          }
        });
        truckMarkerInfoWindow.addListener('closeclick', (event)=>{
          console.log('closeclick event of truckMarkerInfoWindow generated:\n', event);
        })
        
        
      }
    }catch(err){
      console.log('some error while updating the map with truck markers\n', err);
    }
    
  
}

  updateAgainNearByTrucks = ()=>{
    setInterval(this.updateCoordinatesToServerAndUpdateMapWithNearByTrucks, this.refreshInterval);
  }

  //helper to query Maps.
  mapFindHelper(truck_id : Number ) : boolean{
    console.log('mapFindHelper executing with value of this as:\n', this);
    console.log('mapFindHelper rcvd truck_id: ', truck_id);
    console.log('mapFIndhelper: bookedbatch size: ', this.currentBookedBatchOfTrucks.size);
    console.log('mapFIndhelper: bookedbatch has ', truck_id, " ?: ", this.currentBookedBatchOfTrucks.has(Number(truck_id)));
    console.log('mapFIndhelper: bookedbatch data:\n', this.currentBookedBatchOfTrucks);
    var temp = this.currentBookedBatchOfTrucks.get(Number(truck_id));
    console.log('mapFindeHelper:temp: ', temp);
    var temp2 = this.currentAcknowledgedBatchOfTrucks.get(Number(truck_id));
    console.log('mapFindeHelper:temp2: ', temp2);

    if((temp!=undefined && temp!=null) || (temp2!=undefined && temp2!=null)){
      console.log('mapFinder found match');
      return true;
    }
      console.log('mapFInder found no match');
    return false;   
  }

  mapFindHelper2(truck_id : Number) : boolean{
    console.log('mapFindHelper2 executing with value of this as:\n', this);
    console.log('mapFindHelper2 rcvd truck_id: ', truck_id);
    console.log('mapFIndhelper2: bookedbatch size: ', this.currentBookedBatchOfTrucks.size);
    console.log('mapFIndhelper2: bookedbatch has ', truck_id, " ?: ", this.currentBookedBatchOfTrucks.has(Number(truck_id)));
    console.log('mapFIndhelper2: bookedbatch data:\n', this.currentBookedBatchOfTrucks);
    let temp3 = this.currentBookedBatchOfTrucks.get(Number(truck_id));
    if((temp3!=undefined && temp3!=null)){
      console.log('mapFinder2 found match');
      return true;
    }
    console.log('mapFInder2 found no match');
    return false;
  }

  mapFIndHelper3(truck_id : Number) : boolean{
    console.log('mapFindHelper3 executing with value of this as:\n', this);
    console.log('mapFindHelper3 rcvd truck_id: ', truck_id);
    console.log('mapFIndhelper3: ackd batch size: ', this.currentAcknowledgedBatchOfTrucks.size);
    console.log('mapFIndhelper3: ackd batch has ', truck_id, " ?: ", this.currentAcknowledgedBatchOfTrucks.has(Number(truck_id)));
    console.log('mapFIndhelper3: ackd batch data:\n', this.currentAcknowledgedBatchOfTrucks);
    let temp4 = this.currentAcknowledgedBatchOfTrucks.get(Number(truck_id));
    if((temp4!=undefined && temp4!=null)){
      console.log('mapFinder3 found match');
      return true;
    }
    console.log('mapFInder3 found no match');
    return false;
  }



  //constantly polls for booked and acknowledged truck's position and updates
  //the customer map with them in real time.
  pollForBookedTruckAck = ()=>{
    console.log('pollForBookedTruckAck executing');
    this.backendServer.findIfTheTruckHasAcknowledgedToServeTheCustomer().toPromise<any>()
    .then((allCusData)=>{
      console.log('pollforbookedtruckack: inside callback: ', allCusData);
      if(allCusData.success==true){
        console.log('allcusdata success');
        this.currentBookedBatchOfTrucks.forEach((val, ky, store)=>{
          console.log('pollForBookedTruckAck: currentBookedBatchOfTrucks.forEach executing');
          console.log('ky: ', ky);
          console.log('val: ', val);
          for(let eachCus of allCusData.customers){
            console.log('eachCus.served_by_id: ', eachCus.served_by_id);
            //need to change this logic later. first check for customer object and then the served_by_id
            if(eachCus.served_by_id==ky){
              this.currentBookedBatchOfTruckInfoWindows.get(Number(ky)).setContent("Truck Will Deliver Soon!");
              let tempTruckInfoWindow = this.currentBookedBatchOfTruckInfoWindows.get(Number(ky));
              console.log('pollForBookedTruckAck: temptruckinfowindow\n', tempTruckInfoWindow );
              
              let tempTruckMarker = this.currentBookedBatchOfTrucks.get(Number(ky));
              console.log('pollForBookedTruckAck: temptruckmarker\n', tempTruckMarker);
              console.log('moving infowindwo from booked to ackd\n', this.currentAcknowledgedBatchOfTruckInfoWindows.set(Number(ky), tempTruckInfoWindow));
              console.log('moving marker from booked to ackd\n', this.currentAcknowledgedBatchOfTrucks.set(Number(ky), tempTruckMarker));
              console.log('removing marker '+ ky +'from booked');
              console.log(this.currentBookedBatchOfTrucks.delete(Number(ky)));
              console.log('removing infowindow from booked\n', this.currentBookedBatchOfTruckInfoWindows.delete(Number(ky)) );
              
              return;
            }else{
              console.log('pollforbookdtruck: eachcus.served_by_id didnt match key');
              console.log('pollforbookdtruck: eachCus.served_by_id: ', eachCus.served_by_id);
            }
          }
        })
      }
    })
    .catch((err)=>{
      console.log('some error while fetching all customers for truck ack finding\n', err);
    })

  }



  

  keepPollingForTruckAcknowledgement = ()=>{
    setInterval(this.pollForBookedTruckAck, this.refreshInterval);
  }


  updateBookedAndAcknowledgedTrucksPositionInRealTimeContinuously = ()=>{
    setInterval(this.updateBookedAndAcknowledgedTrucksPosition, this.refreshInterval);
  }

  updateBookedAndAcknowledgedTrucksPosition = ()=>{
    console.log('updateBookedAndAcknowledgedTrucksPosition: attempting to update posn of booked and ackd trucks');
    if(this.currentBookedBatchOfTrucks.size!==0 || this.currentAcknowledgedBatchOfTrucks.size!==0 ){
      this.backendServer.getNearByTrucks(this.customerObjectResolved).toPromise()
      .then((allNearByTrucks)=>{
        if(allNearByTrucks.success==true){
          
          this.currentBookedBatchOfTrucks.forEach((val,key,mp)=>{
            console.log('key of booked batch of trucks is: ', key);
            let tempBookedTruckRealTime = allNearByTrucks.trucks.find((tempElem)=>{
              return Number(tempElem.user_id_id)==Number(key);
            });
            if(tempBookedTruckRealTime!==undefined){
              //will just setting here reflect change in the hashmap?
              console.log('tempBookedTruckRealTime is:\n', tempBookedTruckRealTime);
              val.setPosition(new google.maps.LatLng(tempBookedTruckRealTime.latitude, tempBookedTruckRealTime.longitude));
              val.setMap(this.mapObject);
              mp.set(Number(key), val);
              console.log('done setting the booked truck marker on gmaps');
            }
          });

          this.currentAcknowledgedBatchOfTrucks.forEach((val, key, mp)=>{
            console.log('key of ackd batch of trucks is: ', key);
            let tempAckdTruckRealTime = allNearByTrucks.trucks.find((tempElem)=>{
              return Number(tempElem.user_id_id)==Number(key);
            });

            if(tempAckdTruckRealTime!==undefined){
              //will just setting here reflect change in the hashmap?
              console.log('tempAckdTruckRealTime is:\n ', tempAckdTruckRealTime);
              val.setPosition(new google.maps.LatLng(tempAckdTruckRealTime.latitude, tempAckdTruckRealTime.longitude));
              val.setMap(this.mapObject);
              mp.set(Number(key), val);
              console.log('done setting the ackd truck marker on gmaps');
            }
            
          });
          
          
        }
      })
      .catch((err)=>{
        console.log('some error fetching near by trucks while updating bookd ackd positions\n', err);
      })
    }
  }
  
}
