import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataTransferService {
  // BehaviorSubject holds the ID and ensures the receiver gets the last value.
  private trainerIdSource = new BehaviorSubject<string | null>(null);
  
  // Expose the ID as an Observable for other components to subscribe to.
  currentTrainerId$ = this.trainerIdSource.asObservable();

  constructor() { }

  setTrainerId(id: string) {
    this.trainerIdSource.next(id);
  }
}
