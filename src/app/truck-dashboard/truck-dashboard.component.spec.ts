import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TruckDashboardComponent } from './truck-dashboard.component';

describe('TruckDashboardComponent', () => {
  let component: TruckDashboardComponent;
  let fixture: ComponentFixture<TruckDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TruckDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TruckDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
