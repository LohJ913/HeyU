import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EarningListPage } from './earning-list.page';

describe('EarningListPage', () => {
  let component: EarningListPage;
  let fixture: ComponentFixture<EarningListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EarningListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
