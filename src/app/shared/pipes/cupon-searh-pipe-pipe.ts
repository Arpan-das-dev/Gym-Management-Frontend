import { Pipe, PipeTransform } from '@angular/core';
import { CuponCodeResponseDto } from '../../core/Models/cuponCodeModels';

@Pipe({
  name: 'cuponSearhPipe'
})
export class CuponSearhPipePipe implements PipeTransform {

  transform(coupons: CuponCodeResponseDto[], searchText: string): any[] {
    if (!coupons) return [];
    if (!searchText || searchText.trim() === '') return coupons;

    const lower = searchText.toLowerCase();

    return coupons.filter(c => {
      return (
        (c.cuponCode && c.cuponCode.toLowerCase().includes(lower)) ||
        (c.planId && c.planId.toLowerCase().includes(lower)) ||
        (c.offPercentage && c.offPercentage.toString().includes(lower))  
      );
    });
  }

}
