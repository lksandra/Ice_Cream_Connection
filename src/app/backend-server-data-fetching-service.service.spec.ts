import { TestBed, inject } from '@angular/core/testing';

import { BackendServerDataFetchingServiceService } from './backend-server-data-fetching-service.service';

describe('BackendServerDataFetchingServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BackendServerDataFetchingServiceService]
    });
  });

  it('should be created', inject([BackendServerDataFetchingServiceService], (service: BackendServerDataFetchingServiceService) => {
    expect(service).toBeTruthy();
  }));
});
