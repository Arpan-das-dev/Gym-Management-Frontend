import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { FreezeRequestDto } from '../Models/MemberServiceModels';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  
  constructor(private http: HttpClient){}
  // Member management related methods will go here
  private baseUrl= 'http://localhost:8080/fitStudio/member-service/'
  // Freeze or Unfreeze Member (if true, freeze; if false, unfreeze)
  freezeMember(id:string,freeze:boolean) :Observable<any>{
    const url = `${this.baseUrl}admin/freeze`;
    const data: FreezeRequestDto ={id,freeze};
    return this.http.post<any>(url,data).pipe(
      tap(res => console.log('Freeze/Unfreeze Member Response:', res))
    );
  }

  // set login Streak for member by using member's id
  setLoginStreak(id:string) :Observable<any>{
    const url = `${this.baseUrl}setStreak`;
    const param = {id : id}
    return this.http.post<any>(url,{}, { params: param }).pipe(
      tap(res => console.log('Set Login Streak Response:', res))
    );
  }

  // get login Streak for member by using member's id
  getLoginStreak(id:string) :Observable<number>{
    const url = `${this.baseUrl}getStreak`;
    const param = {id : id}
    return this.http.get<number>(url, { params: param }).pipe(
      tap(res => console.log('Get Login Streak Response:', res))
    );
  }

  // get member's profile info by id
  getMemberProfile(id:string) :Observable<any>{
    const url = `${this.baseUrl}getBy`;
    const param = {id : id}
    return this.http.get<any>(url, { params: param }).pipe(
      tap(res => console.log('Get Member Profile Response:', res))
    );
  }

  // get all members info with paging with filters and sorting
  getAllMembers(searchBy:string, gender:string,
                status:string, sortBy:string,
                sortDirection:string, pageNo:number, pageSize:number):Observable<any> {
    const url = `${this.baseUrl}admin/getAll`;
    const params = {
      searchBy: searchBy,
      gender: gender,
      status: status,
      sortBy: sortBy, 
      sortDirection: sortDirection,
      pageNo: pageNo,
      pageSize: pageSize
    }

    return this.http.get<any>(url, { params: params }).pipe(
      tap(res => console.log('Get All Members Response:', res))
    );
  }

  // delete member by id 
  deleteMember(id:string) :Observable<any>{
    const url = `${this.baseUrl}admin/delete`;
    const param = {id : id}
    return this.http.delete<any>(url, { params: param }).pipe(
      tap(res => console.log('Delete Member Response:', res))
    );
  }

  /* 
   here goes the all methods which is required to upload member profile image
   and get profile image url of member by id
  */

   private memberProfileBaseUrl = 'http://localhost:8080/fitStudio/member-service/profile'

   // method for uploading member profile image which requires member id and image file as input
   // in the request parameter and returns the profile image url of the member if failed then returns error message

   uploadMemberProfileImage(memberId: string, imageFile: File): Observable<string> {
    const url = `${this.memberProfileBaseUrl}/member/upload`;
    const formData: FormData = new FormData();
    formData.append('memberId', memberId);
    formData.append('image', imageFile, imageFile.name);
    return this.http.post<any>(url, formData).pipe(
      tap(res => console.log('Upload Member Profile Image Response:', res)),
    );
  }

  // method for getting member's profile image url by member id
  getMemberProfileImageUrl(memberId: string) :Observable<any> {
    const url = `${this.memberProfileBaseUrl}/all/getProfileImage`
    const param = {id: memberId}
    return this.http.get<any>(url, { params: param }).pipe(
      tap(res => console.log('Get Member Profile Image URL Response:', res))
    );
  }

  // delete member's profile image by member id
  deleteMemberProfileImage(memberId: string) :Observable<any> {
    const url = `${this.memberProfileBaseUrl}/member/delete`
    const param = {id: memberId}
    return this.http.delete<any>(url, { params: param }).pipe(
      tap(res => console.log('Delete Member Profile Image Response:', res))
    );
  }


   }
