import { HttpClient } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { IonRouterOutlet, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { base64StringToBlob, blobToDataURL } from 'blob-util';
import { distinctUntilChanged } from 'rxjs/operators';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ToolService {

  constructor(
    private navCtrl: NavController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }

  lengthof(x) {
    return x ? Object.keys(x).length : 0
  }

  navTo(path) {
    this.navCtrl.navigateForward(path)
  }

  navRoot(path, direction) {
    this.navCtrl.navigateRoot(path, { animated: true, animationDirection: direction })
  }

  async showToast(msg, color, position) {
    const toast = await this.toastCtrl.create({
      message: msg,
      color: color,
      position: position,
      duration: 2000
    });
    toast.present();
  }

  async showLoading(msg) {
    const loading = await this.loadingCtrl.create({
      message: msg,
    });

    loading.present();
  };

  async dismissLoading() {
    await this.loadingCtrl.dismiss()
  }

  async compressBase64Image(base64Image: string, maxWidth: number, maxHeight: number, quality: number): Promise<string> {
    const img = new Image();
    img.src = base64Image;

    await new Promise<void>(resolve => {
      img.onload = () => resolve()
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    let width = img.width;
    let height = img.height;

    if (width > height) {
      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
      }
    }

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);

    return new Promise(resolve => {
      canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.readAsDataURL(blob!);
        reader.onloadend = () => {
          const compressedBase64Image = reader.result?.toString();
          resolve(compressedBase64Image!);
        };
      }, 'image/jpeg', quality);
    });
  }

  pictureToLink(image, userid) {
    return new Promise((resolve, reject) => {
      this.http.post('https://0w4xkg8ca0.execute-api.ap-southeast-1.amazonaws.com/dev/upload', { image: image, folder: 'vsing', userid: (userid + Date.now()) }, { observe: 'response' }).subscribe((res) => {
        if (res['status'] === 200) {
          resolve({ success: true, link: res['body']['imageURL'] })
        }

        if (res['status'] !== 200)
          reject({ success: false, message: 'Something went wrong!' })
      }, error => {
        reject({ success: false, message: error['message'] })
      })
    })
  }

  async uploadPhoto(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        // Check Camera Permissions
        const permissions = await Camera.checkPermissions();
        console.log(permissions);

        defineCustomElements(window);

        // Get Photo
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: CameraResultType.Base64,
          source: CameraSource.Prompt,
          promptLabelHeader: 'Upload Photo',
          promptLabelPicture: 'Camera',
          promptLabelPhoto: 'Select from Photo Library',
          promptLabelCancel: 'Cancel'
        });

        // Convert Base64 String to Blob
        let imageBlob = base64StringToBlob(image.base64String.replace(/^data:image\/\w+;base64,/, ""), 'image/png');
        var dataURL = await blobToDataURL(imageBlob);

        // Compress Image
        this.compressBase64Image(dataURL, 500, 500, 1).then((res) => {
          let compressedBlob = base64StringToBlob(res.replace(/^data:image\/\w+;base64,/, ""), 'image/png');
          let filesize = compressedBlob.size;

          // Check if file size is below the limit
          if (filesize < 10485768) {
            resolve(dataURL); // Resolve the promise on successful upload
          } else {
            alert("Your Current Image is Too Large, " + this.getBlobSizeInMB(imageBlob) + "MB! (Please choose a file smaller than 8MB)");
            reject(new Error("Image too large"));
          }
        }).catch((err) => {
          reject(err); // Reject the promise on error during compression
        });
      } catch (error) {
        reject(error); // Reject the promise on any other error
      }
    });
  }

  getBlobSizeInMB(blob: Blob): number {
    return blob.size / (1024 * 1024);
  }

  makeDateNicer(dater: any): Promise<string> {
    let today = new Date().getTime();
    return new Promise((resolve) => {
      if (this.datePipe.transform(dater, 'yyyyMMdd') == this.datePipe.transform(today, 'yyyyMMdd')) {
        resolve(this.datePipe.transform(dater, 'h:mm a'));
      } else if (this.datePipe.transform(dater, 'yyyyMMdd') < this.datePipe.transform(today, 'yyyyMMdd')) {
        console.log('here')
        if (this.datePipe.transform(dater, 'yyyyMMdd') >= this.datePipe.transform(new Date(new Date(today).getFullYear(), new Date(today).getMonth(), new Date(today).getDate() - 1, 0, 0, 0), 'yyyyMMdd')) {
          resolve('Yesterday');
        } else if (this.datePipe.transform(dater, 'yyyyMMdd') >= this.datePipe.transform(new Date(new Date(today).getFullYear(), new Date(today).getMonth(), new Date(today).getDate() - 6, 0, 0, 0), 'yyyyMMdd')) {
          resolve(this.datePipe.transform(dater, 'EEEE'));
        } else {
          resolve(this.datePipe.transform(dater, 'dd/MM/yyyy'));
        }
      } else {
        resolve(this.datePipe.transform(dater, 'dd/MM/yyyy'));
      }
    });
  }

  calculateAgeFromString(dobString: string): number {
    // Split the date string into day, month, and year
    const [day, month, year] = dobString.split('/').map(Number);
    
    // Create a new Date object using the parsed values
    const birthDate = new Date(year, month - 1, day); // Month is zero-based in JS
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
  
    // Check if the birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    return age;
  }
  
}
