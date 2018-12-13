////////////////////////////////////////////////////////////////////////
//Package: app-routing.module
//Author: Lakshmi kanth sandra
//Version: v2.0
//Development Environment: Toshiba Satellite Windows
////////////////////////////////////////////////////////////////////////
//Required Files:
//===============
//customer-dashboard.component.TS
//truck-dashboard.componen.TS
//----------------------------------------------------------------------
//Operations:
//===========
//This package deals primarily with routing to appropriate components.

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {CustomerDashboardComponent} from './customer-dashboard/customer-dashboard.component';
import {TruckDashboardComponent} from './truck-dashboard/truck-dashboard.component';
const routes: Routes = [
  {path: 'customer/dashboard', component: CustomerDashboardComponent },
  { path: 'customer', redirectTo: 'customer/dashboard', pathMatch: 'full' },
  {path: 'truck/dashboard', component: TruckDashboardComponent}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule { }
