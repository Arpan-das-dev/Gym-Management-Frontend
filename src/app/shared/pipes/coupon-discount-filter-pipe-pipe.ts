import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'couponDiscountFilterPipe'
})
export class CouponDiscountFilterPipePipe implements PipeTransform {

  transform(list: any[], minDiscount: number | null): any[] {
    if (!minDiscount) return list;

    return list.filter(c => c.offPercentage >= minDiscount);
  }
}
