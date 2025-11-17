import { Pipe, PipeTransform } from '@angular/core';
import { CuponCodeResponseDto } from '../../core/Models/cuponCodeModels';

@Pipe({
  name: 'cuponsSortPipe'
})
export class CuponsSortPipePipe implements PipeTransform {

  transform(list: any[], field: string): any[] {
    if (!field || !list) return list;

    return [...list].sort((a, b) => {
      if (field === 'validTill') {
        return new Date(a.validityDate).getTime() - new Date(b.validityDate).getTime();
      }
      return (a[field] || 0) - (b[field] || 0);
    });
  }

}
