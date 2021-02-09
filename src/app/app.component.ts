import { OneSignal } from '@ionic-native/onesignal/ngx';
import { Component } from '@angular/core';
import { AngularFireAuth } from "angularfire2/auth";
import { Platform, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from "@angular/router";
import { AngularFirestore } from '@angular/fire/firestore';
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from "@ionic-native/native-geocoder/ngx";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private auth: AngularFireAuth,
    public route: Router,
    private oneSignal: OneSignal,
    private alertCtrl: AlertController,
    public afs: AngularFirestore,
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,

  ) {
    this.initializeApp();

  }

  userID: string;
  checkLogin() {
    this.auth.authState.subscribe(res => {
      if (res && res.uid) {
        console.log("userID=>", res.uid);
        this.userID = res.uid
        console.log("userID=>", this.auth.auth.currentUser.uid);

        if (!res.emailVerified) {
          this.route.navigate(['authentication'])
          setTimeout(() => {
            this.auth.auth.signOut();
          }, 7000);
        }
        else {

          setTimeout(() => {
            this.route.navigate(["home/feed"])
            this.getplayerID()
            this.getGeolocation()
            console.log("user login");
          }, 3000);
        }
      }
      else {
        this.auth.auth.signOut();
        this.route.navigate(["authentication"])
        console.log("user not loged in");

      }
    })
  }

  latitude: number;
  longitude: number;
  accuracy: number;
  address: any;
  //Get current coordinates of device
  getGeolocation() {


    this.geolocation
      .getCurrentPosition()
      .then((resp) => {
        this.latitude = resp.coords.latitude;
        this.longitude = resp.coords.longitude;
        this.accuracy = resp.coords.accuracy;

        this.getGeoencoder(resp.coords.latitude, resp.coords.longitude);
        if (resp.coords.latitude && resp.coords.longitude) {

        }
      })
      .then(() => { })
      .catch((error) => {
        this.getGeolocation()
      });
  }
  //Geocoder configuration
  geoencoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5,
  };

  //geocoder method to fetch address from coordinates passed as arguments
  getGeoencoder(latitude, longitude) {
    console.log("adress got uploading to irestore");

    this.nativeGeocoder
      .reverseGeocode(latitude, longitude, this.geoencoderOptions)
      .then((result: NativeGeocoderResult[]) => {
        this.address = this.generateAddress(result[0]);

        const Lattitude = this.latitude;
        const Longitude = this.longitude;
        const FetchedAdress = this.address;
        const Accuracy = this.accuracy;
        this.afs.collection("users").doc(this.userID).update({
          Lattitude,
          Longitude,
          FetchedAdress,
          Accuracy,
        });
      })
      .then(() => {
        console.log('location updated on user accoun')
      })
      .catch((error: any) => {

        this.getGeolocation();
      });
  }



  //Return Comma saperated address
  generateAddress(addressObj) {
    let obj = [];
    let address = "";
    for (let key in addressObj) {
      obj.push(addressObj[key]);
    }
    obj.reverse();
    for (let val in obj) {
      if (obj[val].length) address += obj[val] + ", ";
    }
    return address.slice(0, -2);
  }

  getplayerID() {


    this.oneSignal.getIds().then(identity => {
      const deviceID = identity.userId;
      this.auth.authState.subscribe(user => {
        this.userID = user.uid;
        this.afs.collection('users').doc(user.uid).update({
          deviceID
        }).then(() => {
          console.log('player id got and updated')
        }).catch(err => {
          console.log('unable to get id');

          this.getplayerID()
        })
      })

    })
  }

  setupPush() {

    this.oneSignal.startInit('a791d179-5a45-416c-8417-7a5b77cc669f', '184492540467');

    this.oneSignal.handleNotificationReceived().subscribe(data => {
      let msg = data.payload.body;
      let title = data.payload.title;
      let additionalData = data.payload.additionalData;
      this.showAlert(title, msg);
    });

    this.oneSignal.endInit();
  }

  async showAlert(title, msg) {
    const alert = await this.alertCtrl.create({
      header: title,
      subHeader: msg,
      mode: 'ios',
      buttons: [
        {
          text: 'CLOSE',
          handler: () => {
            // E.g: Navigate to a specific screen
          }
        }
      ]
    })
    alert.present();
  }



  initializeApp() {
    this.platform.ready().then(() => {
      console.log('platform ready');

      this.statusBar.show();
      this.statusBar.backgroundColorByHexString("ffffff");
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.setupPush()
      this.checkLogin();
    });
  }

}
