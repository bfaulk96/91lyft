import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'phoneNumber'})
export class PhoneNumberPipe implements PipeTransform {
  transform(value: string): string {
    const countryCode = value.substr(0,2);
    const areaCode = value.substr(2,3);
    const firstFour = value.substr(5, 3);
    const lastThree = value.substr(8, 4);
    return countryCode + " (" + areaCode + ")-" + firstFour + "-" + lastThree;
  }
}
