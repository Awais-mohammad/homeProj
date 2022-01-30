import { DisplayShopPage } from './../../display-shop/display-shop.page';
import { OneSignal } from "@ionic-native/onesignal/ngx";
import { UserProfilePage } from "./../../user-profile/user-profile.page";
import { Router } from "@angular/router";
import { ToastController } from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { LoadingController, ModalController } from "@ionic/angular";
import { AngularFirestore } from "@angular/fire/firestore";
import * as firebase from "firebase/app";
import { AngularFireAuth } from "angularfire2/auth";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AngularFireStorage } from "@angular/fire/storage";
import { Camera, CameraOptions } from "@ionic-native/Camera/ngx";
import { FileTransfer, FileUploadOptions, FileTransferObject } from "@ionic-native/file-transfer/ngx";
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform, AlertController } from '@ionic/angular';
import { CommentsPage } from 'src/app/comments/comments.page';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { ActionSheetController } from '@ionic/angular';


@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {

  constructor(
    private firestore: AngularFirestore,
    public toasts: ToastController,
    private startLoad: LoadingController,
    private firebaseauth: AngularFireAuth,
    private router: Router,
    private http: HttpClient,
    private storage: AngularFireStorage,
    private camera: Camera,
    public File: FileTransfer,
    public modal: ModalController,
    public onesignal: OneSignal,
    private statusBar: StatusBar,
    private platform: Platform,
    private socialSharing: SocialSharing,
    public actionSheetController: ActionSheetController,
    private alertCtrl: AlertController,
  ) {
    let currentDate = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    this.today = currentDate.getDate() + ' ' + monthNames[currentDate.getMonth()] + ' ' + currentDate.getFullYear()

  }

  one: boolean = false;

  toogle() {
    this.one = !this.one
  }

  ///VARIABLES

  loadermsg: string;
  loaderID: string;
  today: string;
  temporary: any;
  tempdocID: string;
  imageData: string;
  clickedImage: string;
  docID: string;

  async presentLoading() {
    const loading = await this.startLoad.create({
      message: this.loadermsg,
      spinner: "dots",
      id: this.loaderID,
    });
    await loading.present();
  }
  msg: string;
  async presentToast() {
    const toast = await this.toasts.create({
      message: this.msg,
      duration: 2000,
      mode: "ios",
      position: 'bottom'
    });
    toast.present();
  }
  userData: any;
  generateKey(name) {
    const key = firebase.firestore().collection(name).doc().id;
    return key;
  }


  getUserdata() {
    this.firestore
      .collection("users")
      .doc(this.UserID)
      .valueChanges()
      .subscribe((res) => {
        this.userData = res;

      });

  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      mode: 'ios',
      buttons: [

        {
          text: 'Logout',
          icon: 'log-out-outline',
          handler: () => {
            this.firebaseauth.auth.signOut();
            this.router.navigate(['authentication']);
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {

          }
        }]
    });
    await actionSheet.present();
  }

  openGallery() {
    const optionsGallery: CameraOptions = {
      quality: 60,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,

    }
    this.camera.getPicture(optionsGallery).then((imageData) => {
      this.imageData = imageData;
      this.msg = "Fetching Image this may take few seconds"
      this.presentToast();
      this.loaderID = "clickImage";
      this.loadermsg = "uploading";
      this.presentLoading();

      this.docID = this.getDocumentID();
      const FileTransfer: FileTransferObject = this.File.create();
      let opt: FileUploadOptions = {
        fileKey: "file",
        fileName: this.docID + this.docID + ".jpg",
        headers: {},
      };
      FileTransfer.upload(this.imageData, "https://exportportal.site/upload.php", opt)
        .then((upload) => {

          this.clickedImage = "https://exportportal.site/uploads/" + this.docID + this.docID + ".jpg";

          this.addCaption()
          this.startLoad.dismiss("clickImage");
        })
        .catch((err) => {

          this.startLoad.dismiss("clickImage");

        });
    }, (err) => {
      this.msg = "Unable to Open gallery please use camera "
      this.presentToast();

    })
  }

  imageCap: string;

  async addCaption() {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Add Caption To Image',
      mode: 'ios',
      backdropDismiss: false,
      inputs: [
        {
          name: 'caption',
          type: 'text',
          placeholder: 'Hooray!! Its my first plantation'
        },

      ],
      buttons: [
        {
          text: 'ADD',
          handler: (alertData) => {
            console.log("alertData.newpassword", alertData.caption);
            if (!alertData.caption) {
              this.msg = 'Caption is a must!!'
              this.presentToast()
              this.addCaption()
            }
            else {
              this.imageCap = alertData.caption
              console.log('caption is', this.imageCap);
              this.addingtouserandpostdoc()
            }

          }
        }
      ]
    });

    await alert.present();
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

      })
      .then(() => {
        this.loaderID = "clickImage";
        this.loadermsg = "uploading";
        this.presentLoading();

        this.docID = this.getDocumentID();
        const FileTransfer: FileTransferObject = this.File.create();
        let opt: FileUploadOptions = {
          fileKey: "file",
          fileName: this.docID + this.docID + ".jpg",
          headers: {},
        };
        FileTransfer.upload(this.imageData, "https://exportportal.site/upload.php", opt)
          .then((upload) => {

            this.clickedImage = "https://exportportal.site/uploads/" + this.docID + this.docID + ".jpg";
            this.startLoad.dismiss("clickImage");
          })
          .catch((err) => {


            this.startLoad.dismiss("clickImage");

          });
      });
  }
  getDocumentID() {
    const id = firebase.firestore().collection("images").doc().id;
    return id;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////UPLOAD TO FIRESTORE/////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  uploadTofirestore() {


    const docOwner = this.UserID
    const uploadedat = this.today;
    const imageURL = this.clickedImage;
    const latitude = this.userData.Lattitude;
    const longitude = this.userData.Longitude;
    const uploaderImage = this.userData.ProfileImage;
    const imageCaption = this.imageCap
    const docID = this.docID
    const timestamp = Date.now()
    const imageDocID = firebase.firestore().collection('images').doc(this.docID).collection('imageData').doc().id
    const uploadedBy = docOwner
    const upImg = this.firestore.collection('images', q => q.where('uploadedat', '==', this.today)
      .where('docOwner', '==', this.UserID)).valueChanges().subscribe(d => {
        if (d.length < 1) {

          upImg.unsubscribe()

          this.firestore.collection('images').doc(this.docID).set({
            docOwner,
            uploadedat,
            docID,
            images: firebase.firestore.FieldValue.arrayUnion({
              imageCaption,
              imageURL,
              latitude,
              longitude,
              uploaderImage,
              timestamp,
              imageDocID,
              uploadedBy,
            })
          }).then(() => {
            this.firestore.collection('images').doc(this.docID).collection('imageData').doc(imageDocID).set({
              imageURL,
              latitude,
              longitude,
              imageCaption,
              uploaderImage,
              timestamp,
              imageDocID,
              uploadedBy,
            }).then(() => {
              this.msg = 'Image uploaded successfully'
              this.presentToast()
              this.toogle()
              this.startLoad.getTop().then(v => {
                if (v != null) {
                  this.startLoad.dismiss("clickImage");
                }
              })
            }).catch(() => {
              this.msg = 'Failed to upload RETRY'
              this.presentToast()
              this.startLoad.getTop().then(v => {
                if (v != null) {
                  this.startLoad.dismiss("clickImage");
                }
              })
            })
          })
        } else {


          this.temporary = d;
          this.tempdocID = this.temporary[0].docID;
          const imageDocID = firebase.firestore().collection('images').doc(this.tempdocID).collection('imageData').doc().id
          this.firestore.collection('images').doc(this.tempdocID).update({
            images: firebase.firestore.FieldValue.arrayUnion({
              imageURL,
              latitude,
              imageCaption,
              longitude,
              uploaderImage,
              timestamp,
              imageDocID,
              uploadedBy,
            })
          }).then(() => {
            this.firestore.collection('images').doc(this.tempdocID).collection('imageData').doc(imageDocID).set({
              imageURL,
              latitude,
              longitude,
              uploaderImage,
              imageCaption,
              timestamp,
              imageDocID,
              uploadedBy,
            }).then(() => {
              this.addingtouserandpostdoc()
              this.msg = 'Image uploaded successfully'
              this.toogle()
              this.presentToast()
              this.startLoad.getTop().then(v => {
                if (v != null) {
                  this.startLoad.dismiss("clickImage");
                }
              })
            }).catch(() => {
              this.msg = 'Failed to upload RETRY'
              this.presentToast()
              this.startLoad.getTop().then(v => {
                if (v != null) {
                  this.startLoad.dismiss("clickImage");
                }
              })
            })
          })
        }
        upImg.unsubscribe()
      })
  }
  addingtouserandpostdoc() {

    const docOwner = this.UserID
    const uploadedat = this.today;
    const imageURL = this.clickedImage;
    const latitude = this.userData.Lattitude;
    const longitude = this.userData.Longitude;
    const uploaderImage = this.userData.ProfileImage;
    const timestamp = Date.now()
    const uploadedBy = docOwner
    const uploaderName = this.userData.Name
    this.firestore.collection('users').doc(this.UserID).update({
      images: firebase.firestore.FieldValue.arrayUnion({
        imageURL,

      })
    })

    this.uploadtoPost()
  }

  uploadtoPost() {
    const docOwner = this.UserID
    const uploadedat = this.today;
    const imageURL = this.clickedImage;
    const latitude = this.userData.Lattitude;
    const longitude = this.userData.Longitude;
    const uploaderImage = this.userData.ProfileImage;
    const timestamp = Date.now()
    const uploadedBy = docOwner
    const uploaderName = this.userData.Name
    const imageCaption = this.imageCap

    const docID = firebase.firestore().collection('postimages').doc().id;
    this.firestore.collection('postimages').doc(docID).set({
      imageURL,
      latitude,
      longitude,
      uploaderImage,
      timestamp,
      uploadedat,
      uploadedBy,
      docID,
      uploaderName,
      imageCaption,
    }).then(() => {

      this.clickedImage = ''
    })
  }

  uploadPrivateImage() {

    const imageCaption = this.imageCap
    const imageURL = this.clickedImage;
    const latitude = this.userData.Lattitude
    const longitude = this.userData.Longitude
    const timestamp = Date.now()
    const uploaderImage = this.userData.ProfileImage
    const docID = firebase.firestore().collection('privateimages').doc().id;

    this.firestore.collection('users').doc(this.UserID).collection('privateimages').doc(docID).set({
      imageURL,
      latitude,
      longitude,
      imageCaption,
      timestamp,
      uploaderImage,
      docID
    })
      .then(() => {
        const imageURL = this.clickedImage;
        const timestamp = Date.now()
        this.firestore.collection('users').doc(this.UserID).update({
          images: firebase.firestore.FieldValue.arrayUnion({
            imageURL,
            timestamp
          })
        }).then(() => {
          this.clickedImage = ''
          this.msg = 'DONE'
          this.presentToast()
          this.toogle()
        })

      })

  }
  UserID: string
  ngOnInit() {
    const auth = this.firebaseauth.authState.subscribe(user => {
      this.UserID = user.uid
      this.getUserdata()
    })
  }

  ionViewWillEnter() {

    this.one = false;
  }
}
