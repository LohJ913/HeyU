import { HttpClient } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { IonRouterOutlet, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { base64StringToBlob, blobToDataURL } from 'blob-util';
import { distinctUntilChanged } from 'rxjs/operators';
import { DatePipe, DecimalPipe } from '@angular/common';
import swal from 'sweetalert'

@Injectable({
  providedIn: 'root'
})
export class ToolService {

  constructor(
    private navCtrl: NavController,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    private http: HttpClient,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
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

  async uploadMultiPhoto(uid, cap) {
    return new Promise(async (resolve, reject) => {
      try {
        // Check and request camera permissions
        const permissions = await Camera.checkPermissions();
        console.log(permissions);

        defineCustomElements(window);

        const val = await Camera.pickImages({
          quality: 90
        });

        let images = [];
        let tempPhotos = [];
        images = val.photos;

        for (let index = 0; index < images.length && index < cap; index++) {
          const element = images[index];
          const res = await fetch(element['webPath']);
          const blob = await res.blob();
          const dataURL = await blobToDataURL(blob);

          await this.compressBase64Image(dataURL, 500, 500, 1).then(async (compressedRes) => {
            const filesize = base64StringToBlob(compressedRes.replace(/^data:image\/\w+;base64,/, ""), 'image/png').size;

            if (filesize < 10485768) { // Less than 10MB
              const file = new File([blob], 'profile.png', { type: 'image/png' });

              const formData = new FormData();
              formData.append('file', file, file.name);
              formData.append('userid', uid);
              formData.append('folder', 'vsing');
              formData.append('isFile', 'true');

              tempPhotos.push(dataURL);
            } else {
              alert("Your Current Image is Too Large, " + this.getBlobSizeInMB(blob) + "MB! (Please choose a file lesser than 8MB)");
            }
          });
        }

        resolve(tempPhotos);
      } catch (error) {
        reject(error);
      }
    });
  }

  // async checkCameraPermission() {
  //   const status = await Permissions.query({ name: 'camera' });

  //   if (status.state === 'granted') {
  //     return true;
  //   } else if (status.state === 'prompt') {
  //     // Request permission
  //     const requestStatus = await Permissions.request({ name: 'camera' });
  //     return requestStatus.state === 'granted';
  //   }

  //   return false;
  // }

  getBlobSizeInMB(blob: Blob): number {
    return blob.size / (1024 * 1024);
  }

  makeDateNicer(dater: any): Promise<string> {
    let today = new Date().getTime();
    let result;
    return new Promise((resolve) => {
      if (this.datePipe.transform(dater, 'yyyyMMdd') == this.datePipe.transform(today, 'yyyyMMdd')) {
        result = 'Today, ' + this.datePipe.transform(dater, 'h:mm a')
        resolve(result);
      } else if (this.datePipe.transform(dater, 'yyyyMMdd') < this.datePipe.transform(today, 'yyyyMMdd')) {
        if (this.datePipe.transform(dater, 'yyyyMMdd') >= this.datePipe.transform(new Date(new Date(today).getFullYear(), new Date(today).getMonth(), new Date(today).getDate() - 1, 0, 0, 0), 'yyyyMMdd')) {
          result = 'Yesterday'
          resolve(result);
        } else if (this.datePipe.transform(dater, 'yyyyMMdd') >= this.datePipe.transform(new Date(new Date(today).getFullYear(), new Date(today).getMonth(), new Date(today).getDate() - 6, 0, 0, 0), 'yyyyMMdd')) {
          result = this.datePipe.transform(dater, 'EEEE')
          resolve(result);
        } else {
          result = this.datePipe.transform(dater, 'dd/MM/yyyy')
          resolve(result);
        }
      } else {
        result = this.datePipe.transform(dater, 'dd/MM/yyyy')
        resolve(result);
      }
    });
  }

  dateShow(date) {
    var display
    var year = new Date(date).getFullYear()
    var month = new Date(date).getMonth()
    var day = parseInt(String(new Date(date).getDate()).padStart(2, '0'));

    var weekday = new Date(date).getDay()
    var week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    var today = new Date(year, month, day); // Today
    var now = new Date(); // Now

    var diff_days = Math.ceil((new Date().getTime() - new Date(date).getTime()) / 1000 / 3600 / 24);
    var is_yesterday = diff_days === 1;
    var last_7days = (diff_days > 1 && diff_days < 7);

    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0, 0);

    if (today.getTime() == now.getTime()) {
      // Today
      // display = this.datepipe.transform(date, 'h:mm a')
      display = 'Today' + ', ' + this.datePipe.transform(date, 'h:mm a')
    }
    else if (is_yesterday) {
      // Yesterday
      display = 'Yesterday' + ', ' + this.datePipe.transform(date, 'h:mm a')
    }
    else if (last_7days) {
      // Less than a week 
      display = week[weekday] + ', ' + this.datePipe.transform(date, 'h:mm a')

    } else {
      display = this.datePipe.transform(date, 'M/d/y, h:mm a')
    }

    return display
  }

  calculateAge(dob) {
    const birthDate = new Date(dob);
    const currentDate = new Date();

    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();
    const dayDiff = currentDate.getDate() - birthDate.getDate();

    // Adjust age if the birth date has not occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
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

  groupArray(arr, chunkSize) {
    const groupedArray = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      groupedArray.push(arr.slice(i, i + chunkSize));
    }
    return groupedArray;
  }


  swalConfirm(title: string, text: string, icon: string,) {
    return new Promise((resolve, reject) => {
      swal({
        title: title,
        text: text,
        icon: icon,
        buttons: ["Cancel", "Confirm"],
      })
        .then((confirm) => {
          if (confirm) {


            // Simulate saving or perform save action here
            // For demonstration purposes, resolve the promise
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });

  }

  swalLoading(title: any, text: any, dismiss: boolean) {
    swal({
      title: title,
      text: text,
      closeOnEsc: dismiss,
      closeOnClickOutside: dismiss,
      buttons: [dismiss],
    });
  }

  swalDismiss() {
    swal.close()
  }

  swal(icon: string, title: string, text: string, timer?: number) {
    const swalConfig: any = {
      icon: icon,
      title: title,
      text: text,
    };
    if (timer) {
      swalConfig.timer = timer;
    }

    swal(swalConfig);
  }

  swalButton(icon: string, title: string, text: string): Promise<boolean> {
    return swal({
      icon: icon,
      title: title,
      text: text,
      buttons: ['Cancel', 'Yes, Confirm'],
      dangerMode: true,
    }).then((confirm) => {
      console.log(confirm);
      return confirm;  // Passes the confirmation result to the `.then()` chain
    });
  }

  dateTransform(x: any, format: string) {
    return this.datePipe.transform(x, format)
  }

  getDistanceBetweenPoints(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers

    // Convert degrees to radians
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distance in kilometers
    return (R * c);
  }


  eightdater(x: Date) {
    return this.datePipe.transform(x, 'yyyyMMdd')
  }

  parseDateString(dateString: string): Date {
    // Extract year, month, day, hour, and minute from the string
    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(4, 6), 10) - 1; // Months are 0-indexed in JS Date
    const day = parseInt(dateString.substring(6, 8), 10);
    const hour = parseInt(dateString.substring(9, 11), 10);
    const minute = parseInt(dateString.substring(11, 13), 10);

    // Return a new Date object
    return new Date(year, month, day, hour, minute);
  }



}
