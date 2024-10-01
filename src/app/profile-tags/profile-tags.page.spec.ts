import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileTagsPage } from './profile-tags.page';

describe('ProfileTagsPage', () => {
  let component: ProfileTagsPage;
  let fixture: ComponentFixture<ProfileTagsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileTagsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
