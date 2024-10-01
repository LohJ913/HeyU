import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavouriteListPage } from './favourite-list.page';

describe('FavouriteListPage', () => {
  let component: FavouriteListPage;
  let fixture: ComponentFixture<FavouriteListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FavouriteListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
