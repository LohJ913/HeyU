import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GiftSenderPage } from './gift-sender.page';

describe('GiftSenderPage', () => {
  let component: GiftSenderPage;
  let fixture: ComponentFixture<GiftSenderPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GiftSenderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
