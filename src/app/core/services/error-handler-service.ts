import { Injectable } from '@angular/core';
import { erroResponseModel, errorOutPutMessageModel } from '../Models/errorResponseModel';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  handleAnyError(error: erroResponseModel) : errorOutPutMessageModel {
    const response : errorOutPutMessageModel = {
      message : error.message,
      status : error.status
    }
    return response;
  }
}
