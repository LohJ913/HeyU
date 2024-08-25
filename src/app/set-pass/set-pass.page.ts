import { Component, OnInit } from '@angular/core';
import { NavController, IonRouterOutlet } from '@ionic/angular';
import { ToolService } from '../services/tool.service';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { PasswordValidator } from 'src/app/validator/password-validator';

@Component({
  selector: 'app-set-pass',
  templateUrl: './set-pass.page.html',
  styleUrls: ['./set-pass.page.scss'],
})
export class SetPassPage implements OnInit {

  passForm: FormGroup;
  validations = {
    'pass': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 8 characters long.' },
      { type: 'pattern', message: 'Your password must contain only numbers and letters.' },
    ],
    'conPass': [
      { type: 'required', message: 'Password is required.' },
      { type: 'areNotEqual', message: 'Password does not match.' }
    ],
    // 'username': [
    //   { type: 'required', message: 'Username is required.' },
    //   { type: 'minlength', message: 'Username must be at least 5 characters long.' },
    //   { type: 'maxlength', message: 'Username cannot be more than 25 characters long.' },
    //   { type: 'pattern', message: 'Your username must contain only numbers and letters.' },
    //   { type: 'usernameNotAvailable', message: 'Your username is already taken.' }
    // ],
  };

  constructor(
    public tool: ToolService,
    private navCtrl: NavController,
    public route: IonRouterOutlet,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.passForm = this.formBuilder.group({
      pass: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      conPass: ['', [Validators.required]],
    }, { validator: PasswordValidator.areNotEqual });

    console.log(this.passForm.get('pass').errors);
    console.log(this.passForm.get('conPass').errors);
  }

  back() {
    this.navCtrl.pop()
  }
}
