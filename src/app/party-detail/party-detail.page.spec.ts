import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartyDetailPage } from './party-detail.page';

describe('PartyDetailPage', () => {
  let component: PartyDetailPage;
  let fixture: ComponentFixture<PartyDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
