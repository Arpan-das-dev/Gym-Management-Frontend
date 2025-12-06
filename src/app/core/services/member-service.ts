import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  FreezeRequestDto,
  PrProgressRequestDto,
  UpdatePrRequestDto,
  MemberPlanInfoResponseDto,
  MemberInfoResponseDto,
} from '../Models/MemberServiceModels';
import { environment } from '../../../environments/environment';
import { TrainerAssignRequestDto } from '../Models/TrainerServiceModels';
import { CookieService } from 'ngx-cookie-service';
import { GenericResponse } from '../Models/genericResponseModels';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  constructor(private http: HttpClient, private cookie: CookieService) {}
  // Member management related methods will go here
  private baseUrl = 'http://localhost:8080/fitStudio/member-service/';
  // Freeze or Unfreeze Member (if true, freeze; if false, unfreeze)
  freezeMember(id: string, freeze: boolean): Observable<any> {
    const url = `${this.baseUrl}admin/freeze`;
    const data: FreezeRequestDto = { id, freeze };
    return this.http
      .post<any>(url, data)
      .pipe(tap((res) => console.log('Freeze/Unfreeze Member Response:', res)));
  }

  // set login Streak for member by using member's id
  setLoginStreak(id: string): Observable<any> {
    console.log('triggerd login streak');

    const url = `${this.baseUrl}setStreak?id=${id}`;
    console.log('url is :: ', url);

    return this.http.post<any>(url, {});
  }

  // get login Streak for member by using member's id
  getLoginStreak(id: string): Observable<any> {
    const url = `${this.baseUrl}getStreak`;
    const param = { id: id };
    return this.http.get<number>(url, { params: param });
  }

  // get member's profile info by id
  getMemberProfile(id: string): Observable<any> {
    const url = `${this.baseUrl}getBy`;
    const param = { id: id };
    return this.http.get<MemberInfoResponseDto>(url, { params: param }).pipe(
      tap((res: MemberInfoResponseDto) => {
        const access: boolean = res.frozen;
        this.cookie.set('hasAccess', `${!access}`, {
          path: '/',
          sameSite: 'Strict',
        });
      })
    );
  }

  hasAccess(memberId: string): boolean {
    const access = this.cookie.get('hasAccess');
    if (!access) this.getMemberProfile(memberId);
    if (access === 'true') return true;
    return false;
  }

  // get all members info with paging with filters and sorting
  getAllMembers(
    searchBy: string,
    gender: string,
    status: string,
    sortBy: string,
    sortDirection: string,
    pageNo: number,
    pageSize: number
  ): Observable<any> {
    const url = `${this.baseUrl}admin/getAll`;
    const params = {
      searchBy: searchBy,
      gender: gender,
      status: status,
      sortBy: sortBy,
      sortDirection: sortDirection,
      pageNo: pageNo,
      pageSize: pageSize,
    };

    return this.http
      .get<any>(url, { params: params })
      .pipe(tap((res) => console.log('Get All Members Response:', res)));
  }

  // delete member by id
  deleteMember(id: string): Observable<any> {
    const url = `${this.baseUrl}admin/delete`;
    const param = { id: id };
    return this.http
      .delete<any>(url, { params: param })
      .pipe(tap((res) => console.log('Delete Member Response:', res)));
  }

  /* 
   here goes the all methods which is required to upload member profile image
   and get profile image url of member by id
  */

  private memberProfileBaseUrl =
    'http://localhost:8080/fitStudio/member-service/profile';

  // method for uploading member profile image which requires member id and image file as input
  // in the request parameter and returns the profile image url of the member if failed then returns error message

  uploadMemberProfileImage(
    memberId: string,
    imageFile: File
  ): Observable<string> {
    const url = `${this.memberProfileBaseUrl}/member/upload`;
    const formData: FormData = new FormData();
    formData.append('memberId', memberId);
    formData.append('image', imageFile, imageFile.name);
    return this.http
      .post<any>(url, formData)
      .pipe(
        tap((res) => console.log('Upload Member Profile Image Response:', res))
      );
  }

  // method for getting member's profile image url by member id
  getMemberProfileImageUrl(memberId: string): Observable<any> {
    const url = `${this.memberProfileBaseUrl}/all/getProfileImage`;
    const param = { id: memberId };
    return this.http
      .get<any>(url, { params: param })
      .pipe(
        tap((res) => console.log('Get Member Profile Image URL Response:', res))
      );
  }

  // delete member's profile image by member id
  deleteMemberProfileImage(memberId: string): Observable<any> {
    const url = `${this.memberProfileBaseUrl}/member/delete?memberId=${memberId}`;
    return this.http.delete<any>(url);
  }

  // member's profile controller to upload member's profile image/delete/view

  private memberProfileImageBaseUrl = `http://localhost:8080/fitStudio/member-service/profile`;

  uploadImage(memberId: string, image: File): Observable<any> {
    console.log('sending to backend for member with id ::' + memberId);

    const uploadUrl = `${this.memberProfileImageBaseUrl}/member/upload?memberId=${memberId}`;

    const formData = new FormData();
    formData.append('image', image);

    return this.http.post(uploadUrl, formData);
  }

  getProfileImage(memberId: string): Observable<any> {
    const url = `${this.memberProfileImageBaseUrl}/all/getProfileImage?memberId=${memberId}`;
    return this.http.get(url);
  }

  deleteProfileImage(memberId: string): Observable<any> {
    const url = `${this.memberProfileImageBaseUrl}/member/delete?memberId=${memberId}`;
    return this.http.delete(url);
  }

  // retreive member's plan info
  private planInfoUrl =
    'http://localhost:8080/fitStudio/member-service/planDetails';
  getPlaninfo(memberId: string): Observable<any> {
    const url = `${this.planInfoUrl}?memberId=${memberId}`;
    return this.http.get<MemberPlanInfoResponseDto>(url).pipe(
      tap((res: MemberPlanInfoResponseDto) => {
        const presentPlan: boolean = !res.planId && !res.planId;
        const duration: boolean = res.planDurationLeft > 0;
        if (!presentPlan && duration) {
          console.log('setting for valid plan is ==> ', true);
          this.cookie.set('validPlan', 'true', {
            path: '/',
            sameSite: 'Strict',
          });
        } else {
          console.log('setting for valid plan is ==> ', false);
          this.cookie.set('validPlan', 'false', {
            path: '/',
            sameSite: 'Strict',
          });
        }
      })
    );
  }

  hasValidPlan(memberId: string): boolean {
    const value = this.cookie.get('validPlan');
    if (!value) this.getPlaninfo(memberId);
    if (value === 'true') return true;
    return false;
  }

  // member fit service
  // this is the member service's fit service base url
  // remaing endpoints will be added later
  private memberFitUrl =
    environment.apiBaseUrl + environment.microServices.MEMBER_SERVICE.Fit;
  // 1. logs bmi and weight entries

  // 1/1 get all bmi entries
  getAllWeightBmiEntriesByMemberId(
    memberId: string,
    pageNo: number,
    pageSize: number
  ): Observable<any> {
    const url = `${this.memberFitUrl}/get/${pageNo}/WeightBmiEntries/${pageSize}?memberId=${memberId}`;
    return this.http.get(url);
  }

  // 1/2 add new bmi entry
  addNewWeightBmiEntry(
    memberId: string,
    weight: number,
    bmi: number,
    date: Date
  ): Observable<any> {
    const url = `${this.memberFitUrl}/weight-bmi-entry?memberId=${memberId}`;
    const body = {
      date: date.toISOString().split('T')[0],
      weight: weight,
      bmi: bmi,
    };
    return this.http.post(url, body);
  }

  // 1/3 delete  old bmi entry
  deleteEntries(memberId: string, date: Date): Observable<any> {
    const url = `${this.memberFitUrl}/deleteWeightBmi`;
    const params = new HttpParams()
      .set('memberId', memberId)
      .set('date', date.toISOString().split('T')[0]);
    return this.http.delete(url, { params });
  }

  // 2 get all bmi and weight entries's summary dto
  getMatrixOfWeightBmi(
    memberId: string,
    pageNo: number,
    pageSize: number
  ): Observable<any> {
    const url = `${this.memberFitUrl}/bmiSummary?memberId=${memberId}&pageNo=${pageNo}&pageSize=${pageSize}`;
    console.log('sending request to..', url);
    return this.http.get(url);
  }

  // 3/1 add new pr record
  addNewPr(
    memberId: string,
    prProgress: PrProgressRequestDto[]
  ): Observable<any> {
    const url = `${this.memberFitUrl}/addPr?memberId=${memberId}`;
    return this.http.post(url, prProgress);
  }

  // 3/2 get all prs my members
  getAllPastPrRecords(
    memberId: string,
    pageNo: number,
    pageSize: number,
    searchBy?: string,
    sortDirection?: string,
    from?: Date,
    to?: Date
  ): Observable<any> {
    let params = new HttpParams()
      .set('memberId', memberId)
      .set('pageNo', pageNo)
      .set('pageSize', pageSize)
      .set('sortDirection', sortDirection || 'DESC');

    if (searchBy && searchBy.trim() !== '') {
      params = params.set('searchBy', searchBy.trim());
    }

    if (from) {
      params = params.set('from', from.toISOString().split('T')[0]);
    }

    if (to) {
      params = params.set('to', to.toISOString().split('T')[0]);
    }

    const url = `${this.memberFitUrl}/getPrs`;

    return this.http.get(url, { params });
  }

  // 3/3 delete a whole day's record
  delteBulkPr(memberId: string, date: string): Observable<any> {
    const url = `${this.memberFitUrl}/deleteOneDay`;
    const params = new HttpParams().set('memberId', memberId).set('date', date);
    return this.http.delete(url, { params: params });
  }

  // 3/4 delete each workout
  deleteOnePr(memberId: string, date: string, workoutName: string) {
    const url = `${this.memberFitUrl}/deletePr/${workoutName}`;
    const params = new HttpParams().set('memberId', memberId).set('date', date);
    return this.http.delete(url, { params: params });
  }

  // 3/5 update pr for one workout of a day
  updateParticularPr(
    memberId: string,
    workoutName: string,
    data: UpdatePrRequestDto
  ): Observable<any> {
    const url = `${this.memberFitUrl}/updatePr/${workoutName}?memberId=${memberId}`;
    return this.http.put(url, data);
  }

  //3/6 get all pr summaries
  getAllPrSummary(
    memberId: string,
    pageNo: number,
    pageSize: number,
    searchBy?: string,
    sortDirection?: string,
    from?: Date,
    to?: Date
  ): Observable<any> {
    let params = new HttpParams()
      .set('memberId', memberId)
      .set('pageNo', pageNo)
      .set('pageSize', pageSize)
      .set('sortDirection', sortDirection || 'DESC');

    if (searchBy && searchBy.trim() !== '') {
      params = params.set('searchBy', searchBy.trim());
    }

    if (from) {
      params = params.set('from', from.toISOString().split('T')[0]);
    }

    if (to) {
      params = params.set('to', to.toISOString().split('T')[0]);
    }

    const url = `${this.memberFitUrl}/prSummary`;
    console.log('sending req to ', url);

    return this.http
      .get(url, { params: params })
      .pipe(tap((res) => console.log(res)));
  }

  getMemberWeightBmiChange(memberId: string): Observable<any> {
    const url = `${this.memberFitUrl}/getBmi/WeightInfo?memberId=${memberId}`;
    console.log('sending req to \n', url);
    return this.http.get(url);
  }
  /**
   * this section is for member and trainer's connection
   * here member can request for trainer see past and upcoming sessions
   * also get minmial details of their trainer's current status
   */
  private MEMBER_TRAINER_URL = `${environment.apiBaseUrl}${environment.microServices.MEMBER_SERVICE.TRAINER}`;

  /**
   *
   * @param {TrainerAssignRequestDto} to request admin for a particular admin
   * @returns {GenericResponse} which contains a message that the request pitched in the admin db
   */
  requestToGetCoach(data: TrainerAssignRequestDto): Observable<any> {
    const url = `${this.MEMBER_TRAINER_URL}/member/request`;
    console.log('Sending request to --> \n', url);
    return this.http.post(url, data);
  }

  /**
   *
   * @param memberId
   * @returns {GenericResponse}
   */
  getTrainerInfo(memberId: string): Observable<any> {
    const url = `${this.MEMBER_TRAINER_URL}/member/getTrainer?memberId=${memberId}`;
    return this.http.get(url);
  }

  getUpComingSessions(
    memberId: string,
    pageNo: number,
    pageSize: number
  ): Observable<any> {
    const url = `${this.MEMBER_TRAINER_URL}/member/sessions/next`;
    const params = new HttpParams()
      .set('memberId', memberId)
      .set('pageNo', pageNo)
      .set('pageSize', pageSize || 15)
    console.log(
      `sending req to backend to get member's upcoming sessions \n ${url}`
    );
    return this.http.get(url,{params});
  }

  getPastSessions(
    memberId: string,
    pageNo: number,
    pageSize: number,
    sortDirection: string
  ): Observable<any> {
    const url = `${this.MEMBER_TRAINER_URL}/member/sessions/past`;
    const params = new HttpParams()
      .set('memberId', memberId)
      .set('pageNo', pageNo)
      .set('pageSize', pageSize || 15)
      .set('sortDirection', sortDirection || 'DESC');
    return this.http.get(url, { params });
  }

  isActiveClients(data : string []) : Observable<any>{
    const url = `${environment.apiBaseUrl}${environment.microServices.MEMBER_SERVICE.COUNT}/trainer/isActiveClients`;
    const body = {
      memberIds : data
    }
    return this.http.post(url, body);
  }
}
