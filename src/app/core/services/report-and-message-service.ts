import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ReportOrMessageCreationRequestDto, ResolveMessageRequestDto } from '../Models/reportServiceModels';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportAndMessageService {
  constructor(private http : HttpClient){}
  /**
   * this is the base url where we gonna implement the other fuctions 
   */

  private URL = `${environment.apiBaseUrl}${environment.microServices.REPORT_MESSAGE_SERVICE.BASE}`

  createRequest(data : ReportOrMessageCreationRequestDto) :Observable<any>{
    const url = `${this.URL}/users/launchReport`;
    return this.http.post(url,data)
  }

  getAllRequestForAdmin(pageNo:number,pageSize:number,sortBy:string,sortDirection:'ASC'|'DESC',role:string,status:string)
  : Observable<any> {
    const url = `${this.URL}/administrator/getReports/${pageNo}/${pageSize}`;
    const params = new HttpParams()
    .set('sortBy',sortBy||'messageTime')
    .set('sortDirection',sortDirection||'DESC')
    .set('role',role|| 'ALL')
    .set('status',status|| 'ALL')
    return this.http.get(url,{params})
  }

  markAsResolveOrDecline(userId:string,data:ResolveMessageRequestDto) :Observable<any> {
    const url = `${this.URL}/administrator/{userId}`;
    return this.http.post(url,data);
  }

  fetchReportsOrMessageByUserId(userId : string) : Observable<any> {
    const url = `${this.URL}/users/status?userId=${userId}`
    return this.http.get(url)
  }

  deleteReportByUser(userId : string, requestId : string) :Observable<any> {
    const url = `${this.URL}/users/deleteReport`;
    const params = new HttpParams().set('userId',userId).set('requestId',requestId);
    return this.http.delete(url,{params})
  }
}
