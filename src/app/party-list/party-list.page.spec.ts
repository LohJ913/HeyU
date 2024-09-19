import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartyListPage } from './party-list.page';

describe('PartyListPage', () => {
  let component: PartyListPage;
  let fixture: ComponentFixture<PartyListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
