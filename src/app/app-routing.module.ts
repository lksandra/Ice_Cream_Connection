import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {CustomerDashboardComponent} from './customer-dashboard/customer-dashboard.component';

const routes: Routes = [
  {path: 'customer/dashboard', component: CustomerDashboardComponent }
  { path: 'customer', redirectTo: 'customer/dashboard', pathMatch: 'full' }
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
