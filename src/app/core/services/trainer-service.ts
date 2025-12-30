import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ReviewAddRequestDto, ReviewUpdateRequestDto } from '../Models/TrainerServiceModels';
import { AddSessionRequestDto, UpdateSessionRequestDto } from '../Models/SessionServiceModel';

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

  getAdminInfoForAllTrainers() :Observable<any> {
    const url = `${this.TRAINER_BASE_URL}/admin/getAll`;
    return this.http.get(url);
  }
  getTrainerClientCount(trainerId :string) : Observable<any> {
    const url = `${this.TRAINER_BASE_URL}/admin/clientInfo/${trainerId}`;
    return this.http.get(url);
  }
  freezeOrUnfreezeTrainer(trainerId: string, freeze : boolean) : Observable<any> {
    const url = `${this.TRAINER_BASE_URL}/admin/freezeTrainer/${trainerId}?value=${freeze}`;
    return this.http.post(url, null);
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
   * 
   * @param trainerId 
   * @returns {TrainerDashBoardInfoResponseDto}
   */
  getDashboardInfo(trainerId :string) : Observable<any> {
    const url = `${this.TRAINER_BASE_URL}/trainer/dashboard?trainerId=${trainerId}`;
    return this.http.get(url);
  }

  /**
   * this mehod is to save trainer's info
   * @param trainerId 
   * @param aboutTrainer
   * @returns {GenericResponse} contains about of the trainer which is updated
   */
  setTrainerAbout(trainerId: string, aboutTrainer: string) :Observable<any>{
    const url = `${this.TRAINER_BASE_URL}/trainer/setAbout`;
    const body ={
      trainerId : trainerId,
      about : aboutTrainer
    }
    return this.http.post(url,body)
  }
  /**
   * 
   */
  getTrainerAbout(trainerId:string) : Observable<any> {
    const url = `${this.TRAINER_BASE_URL}/all/getAbout?trainerId=${trainerId}`;
    return this.http.get(url)
  }

  /**
   * This section is for Speciality for trainer
   * 1. get All available specialites 2. get speciality by trainer id
   * 3. delete speciality 4. replace speciality
   */
  getAllPreDefinedSpecialites() : Observable<any> {
    const url = `${this.TRAINER_BASE_URL}/trainer/getSpecialites`;
    return this.http.get(url);
  }

  getSpecialityByTrainerId(trainerId: string) : Observable<any> {
    const url = `${this.TRAINER_BASE_URL}/all/getSpeciality?trainerId=${trainerId}`;
    return this.http.get(url);
  }

  addNewSpecialityByTrainerId(trainerId:string, speciality:string) :Observable<any>{
    const url = `${this.TRAINER_BASE_URL}/trainer/speciality`;
    const params = new HttpParams().set('trainerId',trainerId).set('speciality',speciality);
    return this.http.post(url, {},{params:params});
  }

  deleteSpecialityByTrainerId(trainerId:string,specialityName:string) : Observable<any> {
    const url = `${this.TRAINER_BASE_URL}/trainer/delete`;
    const params = new HttpParams().set('trainerId',trainerId).set('specialityName',specialityName);
    return this.http.delete(url,{params:params})
  }
  replaceSpeciality(oldSpeciality:string, newSpeciality:string, trainerId:string) :Observable<any> {
    const url =`${this.TRAINER_BASE_URL}/trainer/update`;
    const params = new HttpParams().set('trainerId',trainerId).set('oldSpecialityName',oldSpeciality).set('newSpecialityName',newSpeciality)
    return this.http.put(url,{params: params})
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

  /**
   * this section for trainer's status where trainer can set their status if they are active or not
   * and only the members and admin can see the requests
   */
  private TRAINER_STATUS_URL= `${environment.apiBaseUrl}${environment.microServices.TRAINER_SERVICE.STATUS}`;

  /**
   * This method is to set status by trainer
   * which required these parameters
   * @param trainerId
   * @param status
   * @returns {GenericResponse}
   */

  setStatus(trainerId:string,status:string) :Observable<any>{
    const url = `${this.TRAINER_STATUS_URL}/trainer/status?status=${status.toUpperCase()}&trainerId=${trainerId}`;
    return this.http.post(url,null);
  }

  /**
   * this method is to get status which can 
   * be requested by any user(eg: member/trainer/admin)
   * which takes a valid trainer Id as param @param trainerId
   * and returns @returns {GenericResponse}
   */
  getStatus(trainerId:string) : Observable<any> {
    const url = `${this.TRAINER_STATUS_URL}/all/status?trainerId=${trainerId}`;
    return this.http.get(url);
  }


  /**
   * this section is for trainer dashboard's 
   * connection with member(clients)
   * where trainer will get the view of his clients and can add or update or delete or view sessions
   * but now this url and methods are for connection with clients
   */
  private TRAINER_CLIENT_URL = `${environment.apiBaseUrl}${environment.microServices.TRAINER_SERVICE.MEMBERS}`;

  /**
   * 
   * @param trainerId 
   * @returns {AllMemberResponseWrapperDto}
   */
  viewAllClients(trainerId : string) : Observable<any> {
    const url = `${this.TRAINER_CLIENT_URL}/trainer/getMemberList?trainerId=${trainerId}`;
    return this.http.get(url);
  }

  /**
   * now here is the section where the trainer will manage the sessions 
   * like adding, updating or deleting what ever
   */
  private TRAINER_SESSION_URL = `${environment.apiBaseUrl}${environment.microServices.TRAINER_SERVICE.SESSION}`

  /** 
   * method for add a new session for a member
   * @param {AddSessionRequestDto}
   * @param {trainerId}
   * @returns {GenericResponse}
   */

  addNewSession(trainerId :string, data : AddSessionRequestDto) : Observable<any> {
    const url = `${this.TRAINER_SESSION_URL}/trainer/addSessions`;
    const params = new HttpParams().set('trainerId',trainerId).set('status','UPCOMING');
    return this.http.post(url,data,{params})
  }
  getUpcomingSessions(trainerId :string,pageNo: number, pageSize : number) :Observable<any> {
    const url = `${this.TRAINER_SESSION_URL}/trainer/getSessions`;
    const params = new HttpParams().set("trainerId",trainerId).set("pageNo",pageNo).set("pageSize",pageSize);
    return this.http.get(url,{params})
  }

  getPastSessions(
    trainerId: string,
    pageNo: number,
    pageSize: number,
    sortDirection: string
  ): Observable<any> {
    const url = `${this.TRAINER_SESSION_URL}/trainer/getSession/${pageSize|| 15}`;
    const params = new HttpParams()
      .set('trainerId', trainerId)
      .set('pageNo', pageNo)
      .set('sortDirection', sortDirection || 'ASC');
    return this.http.get(url, { params });
  }

  updateSession(data:UpdateSessionRequestDto,sessionId:string) : Observable<any>{
    const url = `${this.TRAINER_SESSION_URL}/trainer/updateSession?sessionId=${sessionId}`;
    return this.http.put(url,data);
  }

  deleteSession(sessionId:string,trainerId:string) : Observable<any> {
    const url = `${this.TRAINER_SESSION_URL}/trainer/deleteSession`;
    const params = new HttpParams().set('sessionId',sessionId).set('trainerId',trainerId);
    return this.http.delete(url,{params})
  }

  updateSessionStatus(sessionId:string,trainerId:string,status:string) : Observable<any> {
    const url = `${this.TRAINER_SESSION_URL}/trainer/setStatus`;
    const params = new HttpParams().set('sessionId',sessionId).set('trainerId',trainerId).set('status',status);
    return this.http.put(url,{},{params})
  }

  /**
   * this section is for trainer's review management
   * 1. add reviews
   * 2. get all reviews (in paginated forms)
   * 3. update any review
   * 4. delete any reviews
   * 5. mark any review as helpfull
   * 6. mark any review as not helpfull
   */

  private TRAINER_REVIEW_URL = `${environment.apiBaseUrl}${environment.microServices.TRAINER_SERVICE.REVIEW}`

  addReviewForTrainer(trainerId:string,data:ReviewAddRequestDto) : Observable<any> {
    const url = `${this.TRAINER_REVIEW_URL}/user/add?trainerId=${trainerId}`;
    return this.http.post(url,data)
  }

  getAllReviews(trainerId:string,pageNo:number,pageSize:number,sortDirection:'ASC'|'DESC') : Observable<any> {
    const url = `${this.TRAINER_REVIEW_URL}/all/getAll`
    const params = new HttpParams().set('trainerId',trainerId)
    .set('pageNo',pageNo).set('pageSize',pageSize)
    .set('sortDirection',sortDirection)
    return this.http.get(url,{params})
  }

  getReviewByUserId(userId:string,pageNo:number,pageSize:number,sortDirection:'ASC'|'DESC' ) : Observable<any> {
    const url = `${this.TRAINER_REVIEW_URL}/user/getReview?userId=${userId}`
    const params = new HttpParams().set('pageNo',pageNo).set('pageSize',pageSize).set('sortDirection',sortDirection)
    return this.http.get(url,{params})
  }

  updateReviewByUser(reviewId: string, data : ReviewUpdateRequestDto): Observable<any> {
    const url = `${this.TRAINER_REVIEW_URL}/user/update?reviewId=${reviewId}`;
    return this.http.put(url,data)
  }

  deleteReviewByUser(userId:string,reviewId:string,trainerId:string) :Observable<any> {
    const url = `${this.TRAINER_REVIEW_URL}/user/delete`;
    const params = new HttpParams().set('userId',userId).set('reviewId',reviewId).set('trainerId',trainerId);
    return this.http.delete(url,{params})
  }

}
