import { ModalController, LoadingController, ActionSheetController, ToastController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { Camera, CameraOptions } from '@ionic-native/Camera/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from "@ionic-native/file-transfer/ngx";

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
    public File: FileTransfer,

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
  collectionID: string;

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
  imgcheck: string;

  openGallery() {

    this.loaderID = 'clickImage'
    this.loadermsg = 'Hold a sec'
    this.presentLoading()
    const optionsGallery: CameraOptions = {
      quality: 60,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,

    }
    this.camera.getPicture(optionsGallery).then((imageData) => {
      this.imageData = imageData;
      this.msg = "Fetching Image this may take few seconds"
      this.presentToast();
      this.uploadImagetoServer()
    }, (err) => {
      this.msg = "Unable to Open gallery please use camera "
      this.presentToast();

    })
  }

  capture() {

    this.loaderID = 'clickImage'
    this.loadermsg = 'Hold a sec'
    this.presentLoading()
    let options = {
      quality: 60,
      targetHeight: 1200,
      correctOrientation: true,
    };
    this.camera
      .getPicture(options)
      .then((img) => {
        this.imageData = img;
        this.uploadImagetoServer()
      });
  }

  generateID() {
    const docID = firebase.firestore().collection('shops').doc(this.PageID).collection(this.collectionName).doc().id
    return docID;
  }

  uploadImagetoServer() {
    if (!this.clickedImage) {
      this.collectionID = this.generateID()
      const FileTransfer: FileTransferObject = this.File.create();
      let opt: FileUploadOptions = {
        fileKey: "file",
        fileName: this.collectionID + '.jpg ',
        headers: {},
      };
      FileTransfer.upload(this.imageData, "http://134.122.2.23/upload.php", opt)
        .then((upload) => {

          this.clickedImage = "http://134.122.2.23/uploads/" + this.collectionID + '.jpg';
          console.log(upload);

        }).then(() => {
          this.loading.dismiss('clickImage')
          this.msg = 'Image uploaded'
          this.presentToast()
          this.addtoFirestore(this.collectionID, 'one')
        }).catch(() => {
          this.loading.dismiss('clickImage')
          this.msg = 'Something went wrong please retry'
          this.presentToast()
        })
    }
    else if (this.clickedImage) {
      const imageURL = this.collectionID + Math.random()

      const FileTransfer: FileTransferObject = this.File.create();
      let opt: FileUploadOptions = {
        fileKey: "file",
        fileName: imageURL + '.jpg ',
        headers: {},
      };
      FileTransfer.upload(this.imageData, "http://134.122.2.23/upload.php", opt)
        .then((upload) => {

          this.clickedImage = "http://134.122.2.23/uploads/" + imageURL + '.jpg';
          console.log(upload);

        }).then(() => {
          this.loading.dismiss('clickImage')
          this.msg = 'Image uploaded'
          this.presentToast()
          this.addtoFirestore(this.collectionID, 'two')
        }).catch(() => {
          this.loading.dismiss('clickImage')
          this.msg = 'Something went wrong please retry'
          this.presentToast()
        })

    }

  }

  addtoFirestore(docID, decide) {
    const collectionName = this.collectionName
    const collectionID = this.collectionID
    const createdAt = Date.now()
    const clickedImage = this.clickedImage

    if (decide == 'one') {
      this.firestore.collection('shops').doc(this.PageID).collection(this.collectionName).doc(docID).set({
        collectionName,
        collectionID,
        createdAt,
        images: firebase.firestore.FieldValue.arrayUnion({
          clickedImage
        })
      }).then(() => {
        this.getcurrentcolimages()
      })
    }

    else if (decide == 'two') {
      this.firestore.collection('shops').doc(this.PageID).collection(this.collectionName).doc(docID).update({
        images: firebase.firestore.FieldValue.arrayUnion({
          clickedImage
        })
      }).then(() => {
        this.getcurrentcolimages()
      })

    }
  }

  shopImages: any;

  getcurrentcolimages() {
    this.firestore.collection('shops').doc(this.PageID)
      .collection(this.collectionName).doc(this.collectionID).valueChanges().subscribe(data => {
        this.shopImages = data;
        console.log('shop images=>', this.shopImages);

      })
  }

  create() {
    const collectionName = this.collectionName;
    const timestamp = Date.now()
    const docID = this.collectionID
    const ownerID = this.shopData.Df.sn.proto.mapValue.fields.OwnerID.stringValue
    this.firestore.collection('shops').doc(this.PageID).collection(this.collectionName).doc(docID).set({
      collectionName,
      timestamp,
      ownerID,
      docID,
    })
  }

  deleteCollection() {
    this.firestore.collection('shops').doc(this.PageID).collection(this.collectionName).
      doc(this.collectionID).delete().then(() => {
        this.msg = 'Discarded!!!'
        this.presentToast()
        this.createcollection = !this.createcollection
      })
  }

  deleteshop() {
    this.firestore.collection('shops').doc(this.PageID).delete().then(() => {
      this.msg = 'page deleted successfully!!'
      this.presentToast()
      this.closePage()
    }).catch(err => {
      this.msg = JSON.stringify(err)
      this.presentToast()
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

  getcollections() {

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
