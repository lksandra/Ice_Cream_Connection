import { Component, ViewChild } from '@angular/core';
import {} from '@types/googlemaps';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Ice_Cream_Connection';
  @ViewChild('gmap') gmapElement: any;
  map: google.maps.Map;
  infoWindow : google.maps.InfoWindow = new google.maps.InfoWindow;
  ngOnInit() {
    var mapProp = {
     // center: new google.maps.LatLng(43.0417898, -76.1228379),
     center: new google.maps.LatLng(35, -76.1228379),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
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
        thisobject.infoWindow.setPosition(pos);
        thisobject.infoWindow.setContent('I am here');
        thisobject.infoWindow.open(thisobject.map);
        thisobject.map.setCenter(pos);
        setTimeout(() => {
          console.log('executing setTimeout after time limit')
          updateCoordinates(thisobject);
        }, 10000);
        console.log('after calling setTimeout');
      }, ()=>{
        handleLocationError(true, thisobject.infoWindow, thisobject.map.getCenter());
      });
    }else{
      //browser doesnt support geolocation
      handleLocationError(false, thisobject.infoWindow, thisobject.map.getCenter());
    }
  }

  
  
}
