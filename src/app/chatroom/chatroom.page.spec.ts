import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatroomPage } from './chatroom.page';

describe('ChatroomPage', () => {
  let component: ChatroomPage;
  let fixture: ComponentFixture<ChatroomPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatroomPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
