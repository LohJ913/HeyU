import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopupModalPage } from './topup-modal.page';

describe('TopupModalPage', () => {
  let component: TopupModalPage;
  let fixture: ComponentFixture<TopupModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TopupModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
