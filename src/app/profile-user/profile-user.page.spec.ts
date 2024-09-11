import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileUserPage } from './profile-user.page';

describe('ProfileUserPage', () => {
  let component: ProfileUserPage;
  let fixture: ComponentFixture<ProfileUserPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileUserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
