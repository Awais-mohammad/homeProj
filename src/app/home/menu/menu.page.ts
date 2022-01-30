import { OpenPolyPage } from './../../open-poly/open-poly.page';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, ModalController } from '@ionic/angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController, ActionSheetController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderOptions, NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import * as firebase from "firebase/app"
import { UserProfilePage } from 'src/app/user-profile/user-profile.page';
import { DisplayShopPage } from 'src/app/display-shop/display-shop.page';

declare var google: any;
@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {

  constructor(
    private router: Router,
    public loadingController: LoadingController,
    public toastControll: ToastController,
    private firebaseauth: AngularFireAuth,
    private firestore: AngularFirestore,
    public alertController: AlertController,
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    public ModalCtrl: ModalController,
    public actionSheetController: ActionSheetController,

  ) {
    setTimeout(() => {
      //    this.initializeMap()
    }, 2000);
  }
  msg: string;
  loadermsg: string;
  loaderID: string;
  currentUID: string;
  adress: string;
  adres: any[];
  array: any[];
  color: any;


  //loading

  //show toast
  async presentToast() {
    const toast = await this.toastControll.create({
      message: this.msg,
      duration: 2000,
      position: 'bottom',
      mode: 'ios',
      color: 'dark',
    });
    toast.present();
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'CHOOSE WHAT TO SEE ON MAP',
      cssClass: 'my-custom-class',
      mode: 'ios',
      buttons: [{
        text: 'My Plantations',
        icon: 'rose-outline',

        handler: () => {

          this.showVendors = false;
          this.showmyplantations = true;
          this.showLocations = false;
          this.msg = 'maps will now only show areas you planted'
          this.presentToast()
          this.getmaps(this.latitude, this.longitude)
        }
      }, {
        text: 'Locations to plant',
        icon: 'navigate-outline',
        handler: () => {

          this.showVendors = false;
          this.showmyplantations = false;
          this.showLocations = true;
          this.msg = 'maps will now only show areas to plant'
          this.presentToast()
          this.getmaps(this.latitude, this.longitude)
        }
      }, {
        text: 'Vendors',
        icon: 'logo-venmo',
        handler: () => {
          this.showVendors = true;
          this.showmyplantations = false;
          this.showLocations = false;
          this.msg = 'maps will now only show vendors'
          this.presentToast()
          this.getmaps(this.latitude, this.longitude)
        }
      },
      {
        text: 'Everything',
        icon: 'aperture-outline',
        handler: () => {

          this.showVendors = true;
          this.showmyplantations = true;
          this.showLocations = true;
          this.msg = 'maps will show everything'
          this.presentToast()
          this.getmaps(this.latitude, this.longitude)
        }
      },
      {
        text: 'Cancel',
        icon: 'close',
        role: 'destructive',
        handler: () => {
          this.msg = 'no changes done'
          this.presentToast()

        }
      }]
    });
    await actionSheet.present();
  }

  logout() {
    this.firebaseauth.auth.signOut();
    this.router.navigate(['authentication'])
  }


  uploadUserLocation() {
    console.log(" this.firebaseauth.auth.currentUser.uid;", this.firebaseauth.auth.currentUser.uid);
    this.currentUID = this.firebaseauth.auth.currentUser.uid;
    if (!this.currentUID) {
      this.msg = 'failed to fetch location Retrying'
      this.getGeolocation();
    }
    else if (!this.address) {
      this.msg = 'failed to fetch location Retrying'
      this.getGeolocation();
    }
    else if (this.latitude == null) {
      this.msg = 'failed to fetch location Retrying'
      this.getGeolocation();
    }
    else if (!this.longitude == null) {
      this.msg = 'failed to fetch location Retrying'
      this.getGeolocation();
    }
    else if (this.accuracy == null) {
      this.msg = 'failed to fetch location Retrying'
      this.getGeolocation();
    }
    else {
      const FetchedAdress = this.address;
      const Lattitude = this.latitude;
      const Longitude = this.longitude;
      const Accuracy = this.accuracy;
      this.firestore.collection('users').doc(this.currentUID).update({
        FetchedAdress,
        Lattitude,
        Longitude,
        Accuracy,
      }).then(() => {
        console.log("location updated to firebase");
        this.loadingController.dismiss('locationfetch')

      })
    }

  }
  //Get current coordinates of device
  getGeolocation() {
    this.loaderID = 'locationfetch'
    this.loadermsg = 'Fetching location'
    this.geolocation.getCurrentPosition().then((resp) => {

      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;
      this.accuracy = resp.coords.accuracy;

      this.getGeoencoder(resp.coords.latitude, resp.coords.longitude);

    }).catch((error) => {
      this.loadingController.dismiss('locationfetch')

      this.getGeolocation()
    });
  }
  // Readable Address
  address: string;

  // Location coordinates
  latitude: number;
  longitude: number;
  accuracy: number;

  //Geocoder configuration
  geoencoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5
  };

  //geocoder method to fetch address from coordinates passed as arguments
  getGeoencoder(latitude, longitude) {
    this.nativeGeocoder.reverseGeocode(latitude, longitude, this.geoencoderOptions)
      .then((result: NativeGeocoderResult[]) => {
        this.address = this.generateAddress(result[0]);
        console.log("adress where you are is=>", this.address);
        this.uploadUserLocation()

      })
      .catch((error: any) => {
        this.loadingController.dismiss('locationfetch')

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
      if (obj[val].length)
        address += obj[val] + ', ';
    }
    return address.slice(0, -2);
  }

  userData: any;

  getuser() {
    this.firebaseauth.authState.subscribe(u => {
      this.currentUID = u.uid;
      this.firestore.collection('users').doc(this.currentUID).valueChanges().subscribe(user => {
        this.userData = user
        if (!this.userData.Lattitude) {
          this.getGeolocation()
        }
        else {
          console.log('userdata', this.userData.Lattitude);
          this.latitude = this.userData.Lattitude;
          this.longitude = this.userData.Longitude
          this.getmaps(this.latitude, this.longitude)
        }
      })
    });
  }



  dest: any;
  vendors: any;

  getVendors() {

  }

  showVendors: boolean = true;
  showLocations: boolean = true;
  showmyplantations: boolean = true;


  getmaps(lat, lng) {
    var map;
    map = new google.maps.Map(document.getElementById('map'), {
      disableDefaultUI: true,
    });
    console.log(lat, lng + "checking something");

    var initialLocation = new google.maps.LatLng(lat, lng);
    map.setCenter(initialLocation);
    map.setZoom(18);


    var marker = new google.maps.Marker({
      position: initialLocation,
      map: map,
      label: 'You are here',
      animation: google.maps.Animation.BOUNCE,
      zIndex: 3,
    });


    marker.setMap(map);

    this.firestore.collection('postimages', q => q.where('uploadedBy', '==', this.currentUID)).valueChanges().subscribe(data => {
      if (data.length < 1) {
    

      }
      else {
        if (this.showmyplantations) {
          console.log('images are=>', data);
          this.imagestomark = data;

          console.log(this.imagestomark, 'imges to makr loc of');

          for (var i = 0; i < this.imagestomark.length; i++) {
            if (this.imagestomark[i].latitude && this.imagestomark[i].longitude) {
              var markers = new google.maps.Marker({
                position: { lat: this.imagestomark[i].latitude, lng: this.imagestomark[i].longitude },
                map: map,
                animation: google.maps.Animation.DROP,
                zIndex: 1,
                icon: 'https://exportportal.site/green%20plant%20white.png'
              });

            }
          }
          markers.setMap(map);
        }

        else {
          console.log('plantations are not shown');

        }

      }
    })

    this.firestore.collection('shops').valueChanges().subscribe(res => {
      if (res.length < 1) {
        console.log('no vendors');

      }
      else {
        if (this.showVendors) {
          this.vendors = res;
          for (var i = 0; i < this.vendors.length; i++) {
            if (this.vendors[i].lattitude && this.vendors[i].longitude) {
              const venmarkers = new google.maps.Marker({
                position: { lat: this.vendors[i].lattitude, lng: this.vendors[i].longitude },
                map: map,
                animation: google.maps.Animation.DROP,
                zIndex: 12,
                icon: 'https://exportportal.site/terraplanterashops.png'
              });
              const a = this.vendors[i].docID;
              venmarkers.addListener("click", () => {
                this.addlistenersonmarker(a);
              });
            }
          }

        }
        else {
          console.log('vendors are not shown');
        }
      }
    })

    this.firestore.collection('locations').valueChanges().subscribe(res => {
      if (res.length < 1) {
        console.log('no locations marked');

      }
      else {
        if (this.showLocations) {
          this.dest = res;
          console.log('destinations', this.dest);

          var polygonOptions;
          var polygon;
          for (var i = 0; i < this.dest.length; i++) {

            console.log(this.dest[i].loc, [i]);
            polygonOptions = {
              paths: this.dest[i].loc,
              strokeColor: this.dest[i].color,
              strokeWeight: "2",
              fillColor: this.dest[i].color,
              fillOpacity: 0.35,
              indexID: i
            };
            polygon = new google.maps.Polygon(polygonOptions);

            polygon.setMap(map);

            this.addListenersOnPolygon(polygon);
          }


        }
        else {
          console.log('locations are not shown');

        }

      }

    })

  }
  addListenersOnPolygon(polygon) {
    const self = this;


    google.maps.event.addListener(polygon, 'click', (event) => {

      console.log(JSON.stringify(event.latLng));
      const check = google.maps.geometry.poly.containsLocation(event.latLng, polygon)
      if (check == true) {
        console.log('yes you clicked inside polygon');
        var a = true;
        console.log('a', a);
        const coords = polygon.getPath().getArray().map(coord => {
          console.log("ghc " + coord.lat, coord.lng);

          return {
            lat: coord.lat(),
            lng: coord.lng()


          }
        });
        this.adres = coords;
        // this.pasValue(this.adres)
        console.log('adress got=>', this.adres);
        for (var i = 0; i < this.adres.length; i++) {
          console.log('lattitudesss', this.adres[i].lat);
          console.log('longitudesss', this.adres[i].lng);

          this.array = new Array()
          for (var p = 0; p < this.array.length; p++) {

            this.array.slice(this.adres[i].lat, this.adres[i].lng)

          }
        }
        console.log('event.lat', JSON.stringify(event.latLng));

        console.log(JSON.stringify(coords, null, 1));
        self.openPolygon(this.adres)
      }
      else {
        console.log('oopss you didnt clicked inside polygon');

      }

    });

  }

  async addlistenersonmarker(markers: any) {
    const model = await this.ModalCtrl.create({
      component: DisplayShopPage,
      cssClass: "my-custom-class",
      id: "userprofile",
      componentProps: {
        PageID: markers,
      },
    });
    return await model.present();
  }


  num: any
  images: any;
  async openPolygon(poly) {

    this.firestore.collection('images', quer => quer.where('lattitude', 'in', poly)).valueChanges().subscribe(res => {
      if (res.length < 1) {
        console.log('no images added');
        this.num = null
      }
      else {
        console.log('image found');
        this.num = res.length
        this.images = res
      }
    })
    const model = await this.ModalCtrl.create({
      component: OpenPolyPage,
      cssClass: "polygonPage",
      id: "polygonDetails",
      componentProps: {
        polygon: this.num,
        images: this.images
      },
    });
    return await model.present();
  }
  imagestomark: any;
  latslong: any[]
  tempa: any;
  temp: any

  ionViewWillEnter() {


  }

  ionViewWillLeave() {
    this.currentUID = null;
    this.userData = null;
  }


  ngOnInit() {

    this.getVendors()
    if (!this.currentUID) {
      this.firebaseauth.authState.subscribe(u => {
        this.currentUID = u.uid
        this.getuser()
      })
    }
    else {

    }
    this.loadingController.getTop().then(v => {
      if (v != null) {

      }
    })

  }
}

