import { TestBed } from '@angular/core/testing';

import { ReadService } from './read.service';
import firebase from 'firebase';


describe('ReadService', () => {
  let service: ReadService;
  firebase.firestore()

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
