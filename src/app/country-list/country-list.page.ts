import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import CountryList from 'country-list-with-dial-code-and-flag'

@Component({
  selector: 'app-country-list',
  templateUrl: './country-list.page.html',
  styleUrls: ['./country-list.page.scss'],
})
export class CountryListPage implements OnInit {

  constructor(
    private viewCtrl: ModalController
  ) { }

  countryList = [];
  keyword = '';
  filteredCountries: any[] = [];

  ngOnInit() {
    this.countryList = CountryList.getAll()
    let arr = CountryList.getAll()

    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      
      if(element['data']['code'] == 'TW'){
        this.countryList[index]['data']['name'] = 'Taiwan'
      }
    }
    
    this.filteredCountries = this.countryList
  }

  filterCountries() {
    const lowerSearchTerm = this.keyword.toLowerCase();

    this.filteredCountries = this.countryList.filter(country => {
      const nameMatch = country.name ? country.name.toLowerCase().includes(lowerSearchTerm) : false;
      const dialCodeMatch = country.dial_code ? country.dial_code.includes(lowerSearchTerm) : false;
      const localNameMatch = country.local_name ? country.local_name.toLowerCase().includes(lowerSearchTerm) : false;
      const codeMatch = country.code ? country.code.toLowerCase().includes(lowerSearchTerm) : false;

      return nameMatch || dialCodeMatch || localNameMatch || codeMatch;
    });
  }

  selectCountry(item) {
    this.viewCtrl.dismiss(item)
  }
}
