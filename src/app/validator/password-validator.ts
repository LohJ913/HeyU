import { FormGroup } from '@angular/forms';

export class PasswordValidator {
    static areNotEqual(formGroup: FormGroup) {
        const pass = formGroup.get('pass').value;
        const conPass = formGroup.get('conPass').value;

        if (pass !== conPass) {
            formGroup.get('conPass').setErrors({ areNotEqual: true });
        } else {
            formGroup.get('conPass').setErrors(null);
        }

        return null;
    }
}