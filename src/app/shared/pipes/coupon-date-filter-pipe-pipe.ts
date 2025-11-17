import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'couponDateFilterPipe'
})
export class CouponDateFilterPipePipe implements PipeTransform {

  transform(list: any[], date: string | null): any[] {
    if (!date) return list;

    const target = new Date(date).getTime();

    return list.filter(c => new Date(c.validityDate).getTime() >= target);
  }

}
