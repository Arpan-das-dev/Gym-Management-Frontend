import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'serarchPipe'
})
export class SerarchPipePipe implements PipeTransform {

  transform(list: string[], searchText : string):string[] {
    if(!searchText) return list;
    const text = searchText.toLowerCase()
    return list.filter(s=> s.toLowerCase().includes(text))
  }

}
