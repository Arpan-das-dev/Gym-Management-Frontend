import { Injectable } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCogs } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loading = new BehaviorSubject <loading | null>(null)

  loading$ = this.loading.asObservable();

   show(message: string, icon : IconDefinition) {
    this.loading.next({ show: true, message, icon });
  }

  hide() {
    this.loading.next({show : false, message : '', icon: faCogs})
  }
}
export interface loading {
  show : boolean;
  message : string;
  icon : IconDefinition
}
