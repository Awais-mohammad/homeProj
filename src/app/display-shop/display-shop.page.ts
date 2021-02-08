import { ModalController, LoadingController, ActionSheetController, ToastController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { Camera, CameraOptions } from '@ionic-native/Camera/ngx';

@Component({
  selector: 'app-display-shop',
  templateUrl: './display-shop.page.html',
  styleUrls: ['./display-shop.page.scss'],
})
export class DisplayShopPage implements OnInit {

  @Input() PageID;

  constructor(
    private modal: ModalController,
    private actionSheet: ActionSheetController,
    public toastControll: ToastController,
    private loading: LoadingController,
    private firebaseauth: AngularFireAuth,
    private firestore: AngularFirestore,
    private camera: Camera,

  ) { }

  //variables
  list: boolean = false;
  editPage: boolean = false;
  collectionName: string;
  loadermsg: string;
  loaderID: string;
  msg: string;
  shopData: any;
  daysDifference: number;
  hoursDifference: number;
  minutesDifference: number;
  secondsDifference: number;
  timeAgo: string;


  //loading
  async presentLoading() {
    const loading = await this.loading.create({
      message: this.loadermsg,
      spinner: "dots",
      id: this.loaderID,
    });
    await loading.present();
  }
  //show toast
  async presentToast() {
    const toast = await this.toastControll.create({
      message: this.msg,
      duration: 2000,
      position: "bottom",
      mode: "ios",
      color: "dark",
    });
    toast.present();
  }

  closePage() {
    this.modal.dismiss('displayshop')
  }

  createcollection: boolean = false;

  checkClick(id) {
    alert('tappd' + id)
  }

  editProfile() {
    this.editPage = !this.editPage;
    if (this.list == true) {
      this.showHidelist()
    }
  }

  createnewcollection() {
    this.createcollection = !this.createcollection;
    if (!this.createcollection) {
      this.showHidelist()
    }
  }
  stage: string = 'name';

  collectionstages(sname: string) {
    if (!this.collectionName && sname == 'uploadphotos') {
      this.msg = 'Field cannot be left blank'
      this.presentToast()
    }
    else {
      this.stage = sname;
    }
  }

  showHidelist() {
    this.list = !this.list
  }

  async ChoosePhotoOption() {
    let actionSheet = this.actionSheet.create({
      header: "Options",
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera-outline',
          handler: () => {
            this.capture();
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'image-outline',
          handler: () => {
            this.openGallery();
          }
        },
      ]
    });
    (await actionSheet).present();
  }

  clickedImage: string;
  imageData: string;

  openGallery() {
    const optionsGallery: CameraOptions = {
      quality: 60,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,

    }
    this.camera.getPicture(optionsGallery).then((imageData) => {
      this.imageData = imageData;
      this.msg = "Fetching Image this may take few seconds"
      this.presentToast();
      //   this.uploadtoServer(type)
    }, (err) => {
      this.msg = "Unable to Open gallery please use camera "
      this.presentToast();

    }).then(() => {

    })
  }

  capture() {


    let options = {
      quality: 60,
      targetHeight: 1200,
      correctOrientation: true,
    };
    this.camera
      .getPicture(options)
      .then((img) => {
        this.imageData = img;

        //   this.uploadtoServer(type)

      });
  }


  create() {
    const docID = firebase.firestore().collection('shops').doc(this.PageID).collection(this.collectionName).doc().id
    const collectionName = this.collectionName;
    const timestamp = Date.now()
    const ownerID = this.shopData.Df.sn.proto.mapValue.fields.OwnerID.stringValue
    this.firestore.collection('shops').doc(this.PageID).collection(this.collectionName).doc(docID).set({
      collectionName,
      timestamp,
      ownerID,
    })
  }

  timeCalc(timeThen) {
    var date2 = new Date();
    var difference = date2.getTime() - timeThen
    this.daysDifference = difference / 1000 / 60 / 60 / 24;
    this.hoursDifference = difference / 1000 / 60 / 60;
    this.minutesDifference = difference / 1000 / 60;
    this.secondsDifference = difference / 1000;
    if (this.secondsDifference < 60) {
      this.timeAgo = Math.floor(this.secondsDifference) + " seconds ago";
      return this.timeAgo;
    } else if (this.minutesDifference < 60) {
      this.timeAgo = Math.floor(this.minutesDifference) + " minutes ago";
      return this.timeAgo;
    } else if (this.hoursDifference < 24) {
      this.timeAgo = Math.floor(this.hoursDifference) + " hours ago";
      return this.timeAgo;
    } else {
      this.timeAgo = Math.floor(this.daysDifference) + " days ago";
      return this.timeAgo;
    }
  }

  getPageData() {
    this.firestore.collection('shops').doc(this.PageID).get().subscribe(data => {
      this.shopData = data;
      console.log('data=>', this.shopData);

    })
  }

  ngOnInit() {
    this.getPageData()
  }

}
