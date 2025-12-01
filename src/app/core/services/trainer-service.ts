import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AllPublicTrainerInfoResponseWrapperDto, TrainerResponseDto } from '../Models/TrainerServiceModels';
import { genericResponseMessage } from '../Models/genericResponseModels';

@Injectable({
  providedIn: 'root',
})
export class TrainerService {
  constructor(private http: HttpClient) {}
  // base url which is resposbile to get profiles for trainers
  // home page (every one can see), admin dashboard (only admin can see more detailed and required details for a trianer)
  // trainer dashboard (to show trainer about their basic details and to perform other opertations for trainers based on that details)

  private TRAINER_BASE_URL = environment.apiBaseUrl+environment.microServices.TRAINER_SERVICE.BASE;

   /**
   * retreives all trainers basic information to show in homepage
   * @returns {AllPublicTrainerInfoResponseWrapperDto}
   * which is a list of {@link PublicTrainerInfoResponseDto}
   */
  getAllBasicInfo() :Observable<any> {
    const url = `${this.TRAINER_BASE_URL}/all/getTrainers`
    return this.http.get(url);
  }

  /**
   * retreives trainer's details for trainer's dasboard which contains more information
   * about the trainers
   * @returns {TrainerResponseDto}
   * @param trainerId
   */

  getTrainerById(trainerId : string) : Observable<any> {
    const url = `${this.TRAINER_BASE_URL}/trainer/get?trainerId=${trainerId}`;
    console.log("sending request to ::=> \n",url);
    return this.http.get(url);
  }

  /**
   * this section is for trainer's profile where trainer can upload only image at any format
   * but the size not be greater than 5 MB
   * get profile image for trainer with trainer id
   * also trainer can delete their current profile image 
   */

  private TRAINER_PROFILE__URL = environment.apiBaseUrl+environment.microServices.TRAINER_SERVICE.PROFILE;

  /**
   * take trainer as parameter of trainer id 
   * calls the backend with the url and queryparam as trainer id
   * @returns {genericResponseMessage} which contains a message of the user's profile image's url
   * stored in the aws s3 
   */
  getProfileImageByTrainerId(trainerId:string): Observable<any> {
    const url = `${this.TRAINER_PROFILE__URL}/all/image?trainerId=${trainerId}`;
    return this.http.get(url);
  }

  /**
   * 
   * @param trainerId 
   * @param image 
   * @returns {genericResponseMessage} which contains a new profile image's url 
   */
  uploadNewProfileImage(trainerId:string, image: File) : Observable <any> {
    console.log('sending to backend for trainer with id ::' + trainerId);
    const url = `${this.TRAINER_PROFILE__URL}/trainer/upload?trainerId=${trainerId}`
    const formData = new FormData();
    formData.append('image',image);
    return this.http.post(url,formData)
  }
  
  /**
   * 
   * @param trainerId 
   * @returns {genericResponseMessage} which contains a message from backend for both success and errors
   */
  deleteProfileImage(trainerId:string) : Observable <any> {
    console.log(`sending backend to delete profile image for trainer::=> ${trainerId}`);
    const url = `${this.TRAINER_PROFILE__URL}/trainer/delete?trainerId=${trainerId}`;
    return this.http.delete(url);
  }
}
