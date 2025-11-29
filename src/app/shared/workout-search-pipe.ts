import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'workoutSearch'
})
export class WorkoutSearchPipe implements PipeTransform {

  transform(value: any [], searchText : string|null|undefined): any[] {
    if (!searchText || searchText.trim() === '') {
      // Returning the full list ensures the dropdown appears when search is empty
      return value;
    }

    // 2. Perform filtering
    const lower = searchText.toLowerCase().trim();

    return value.filter(v => {
      // Ensure the array element is a string before calling toLowerCase
      if (typeof v !== 'string') {
        return false;
      }
      // CORRECTED: Use the 'lower' variable for filtering
      return v.toLowerCase().includes(lower);
    });
  }

}
