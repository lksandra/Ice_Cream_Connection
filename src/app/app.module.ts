////////////////////////////////////////////////////////////////////////
//Package: app.module.ts
//Author: Lakshmi kanth sandra
//Version: v2.0
//Development Environment: Toshiba Satellite Windows
////////////////////////////////////////////////////////////////////////
//Required Files:
//===============
//customer-dahsboard.component.ts
//truck-dashboard.component
//backend-server-data-fetching-service.service
//----------------------------------------------------------------------
//Operations:
//===========
//this package is the root component used for bootstrapping the application.
/////////////////////////////////////////////////////////////////////////


import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http'

import { AppComponent } from './app.component';
import { AppRoutingModule } from './/app-routing.module';
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';
import { TruckDashboardComponent } from './truck-dashboard/truck-dashboard.component';
import {BackendServerDataFetchingServiceService} from './backend-server-data-fetching-service.service'

@NgModule({
  declarations: [
    AppComponent,
    CustomerDashboardComponent,
    TruckDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
    
  ],
  providers: [BackendServerDataFetchingServiceService],
  bootstrap: [AppComponent]
})
export class AppModule { }
