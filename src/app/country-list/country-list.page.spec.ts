import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CountryListPage } from './country-list.page';

describe('CountryListPage', () => {
  let component: CountryListPage;
  let fixture: ComponentFixture<CountryListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CountryListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
