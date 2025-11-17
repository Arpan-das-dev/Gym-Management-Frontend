import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cuponUsersFilterPipe'
})
export class CuponUsersFilterPipePipe implements PipeTransform {

  transform(list: any[], minUsers: number | null): any[] {
    if (!minUsers) return list;
    return list.filter(c => c.users >= minUsers);
  }
}
