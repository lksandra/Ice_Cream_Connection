////////////////////////////////////////////////////////////////////////
//Package: Schema.TS
//Author: Lakshmi kanth sandra
//Version: v2.0
//Development Environment: Toshiba Satellite Windows
////////////////////////////////////////////////////////////////////////
//Required Files:
//===============
//----------------------------------------------------------------------
//Operations:
//===========
//this package declares the interfaces of customer and truck to be used 
//by all the other components.
//----------------------------------------------------------------------
//public interface:
//=================
//class customer is the interface for customer object.
//class truck is the interface for the the truck object.


export class customer {
    customer_id : Number;
    latitude: Number;
    longitude: Number;
    served: Number;
    served_by_id: Number;
    constructor(custid : Number, latitude: Number, longitutde: Number){
        this.customer_id=custid;
            this.latitude = latitude;
            this.longitude = longitutde;
    }

}

export class truck{
    truck_id: Number;
    latitude: Number;
    longitude: Number;
    destination_latitude : Number;
    destination_longitude : Number;
    constructor(truckid : Number, lat : Number, lng : Number){
        this.truck_id = truckid;
        this.latitude=lat;
        this.longitude = lng;
    }    
    
}