import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPassPage } from './login-pass.page';

describe('LoginPassPage', () => {
  let component: LoginPassPage;
  let fixture: ComponentFixture<LoginPassPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPassPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
