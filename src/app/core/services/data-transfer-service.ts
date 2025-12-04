import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { publicTrainerInfoResponseDtoList } from '../Models/TrainerServiceModels';

@Injectable({
  providedIn: 'root'
})
export class DataTransferService {
  
  // BehaviorSubject holds the ID and ensures the receiver gets the last value.
  private trainerObjectSource = new BehaviorSubject<publicTrainerInfoResponseDtoList| null> (null)
  private trainerIdSource = new BehaviorSubject<string | null>(null);
  
  // Expose the ID as an Observable for other components to subscribe to.
  currentTrainerObject$ = this.trainerObjectSource.asObservable();
  currentTrainerId$ = this.trainerIdSource.asObservable();

  constructor() { }

    // SET FULL OBJECT
  setTrainerObject(trainer: publicTrainerInfoResponseDtoList) {
    this.trainerObjectSource.next(trainer);
    this.trainerIdSource.next(trainer.id);     // backup
  }

  // SET ONLY ID (fallback)
  setTrainerId(id: string) {
    this.trainerIdSource.next(id);
  }

  // GETTERS (sync)
  getTrainerObject() {
    return this.trainerObjectSource.getValue();
  }

  getTrainerId() {
    return this.trainerIdSource.getValue();
  }

}
