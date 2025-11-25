import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { FreezeRequestDto } from '../Models/MemberServiceModels';

@Injectable({
  providedIn: 'root',
})
export class MemberService {
  constructor(private http: HttpClient) {}
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
    return this.http
      .get<number>(url, { params: param });
  }

  // get member's profile info by id
  getMemberProfile(id: string): Observable<any> {
    const url = `${this.baseUrl}getBy`;
    const param = { id: id };
    return this.http
      .get<any>(url, { params: param });
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
    return this.http.delete<any>(url)
      
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

  getProfileImage(memberId:string) : Observable<any> {
    const url = `${this.memberProfileImageBaseUrl}/all/getProfileImage?memberId=${memberId}`
    return this.http.get(url);
  }

  deleteProfileImage(memberId : string) : Observable<any> {
    const url = `${this.memberProfileImageBaseUrl}/member/delete?memberId=${memberId}`
    return this.http.delete(url);
  }

  // retreive member's plan info 
  private planInfoUrl = 'http://localhost:8080/fitStudio/member-service/planDetails'
  getPlaninfo(memberId : string) : Observable<any>{
    const url = `${this.planInfoUrl}?memberId=${memberId}`
    return this.http.get(url);
  }
}
