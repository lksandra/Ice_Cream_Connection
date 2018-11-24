import { Component, OnInit, ViewChild } from '@angular/core';
import {} from '@types/googlemaps';

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {
  @ViewChild('gmapcustomer') gmapElem: any;
  mapObject: google.maps.Map;
  infoWindowObject : google.maps.InfoWindow = new google.maps.InfoWindow;

  constructor() { }

  ngOnInit() {
    var mapPropObject = {
     // center: new google.maps.LatLng(43.0417898, -76.1228379),
     center: new google.maps.LatLng(35, -76.1228379),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.mapObject = new google.maps.Map(this.gmapElem.nativeElement, mapPropObject);
    console.log(this);
    //this function continuously updates the browser location.
    updateCoordinates(this);
  }

  function handleLocationError(browserHasGeolocation : boolean, infoWindow : google.maps.InfoWindow , 
    pos : google.maps.LatLng) {
      infoWindow.setPosition(pos);
      infoWindow.setContent(browserHasGeolocation ?
                            'Error: The Geolocation service failed.' :
                            'Error: Your browser doesn\'t support geolocation.');
      infoWindow.open(this.map);
  }

  var updateCoordinates : any = (thisobject : object)=>{
    console.log(thisobject);
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position)=>{
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        thisobject.infoWindowObject.setPosition(pos);
        thisobject.infoWindowObject.setContent('You are here!');
        thisobject.infoWindowObject.open(thisobject.mapObject);
        thisobject.mapObject.setCenter(pos);
        setTimeout(() => {
          console.log('executing setTimeout after time limit')
          updateCoordinates(thisobject);
        }, 10000);
        console.log('after calling setTimeout');
      }, ()=>{
        handleLocationError(true, thisobject.infoWindowObject, thisobject.mapObject.getCenter());
      });
    }else{
      //browser doesnt support geolocation
      handleLocationError(false, thisobject.infoWindowObject, thisobject.mapObject.getCenter());
    }
  }

}
