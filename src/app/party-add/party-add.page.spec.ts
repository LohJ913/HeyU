import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartyAddPage } from './party-add.page';

describe('PartyAddPage', () => {
  let component: PartyAddPage;
  let fixture: ComponentFixture<PartyAddPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
