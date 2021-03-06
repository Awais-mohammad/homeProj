import { Platform } from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireAuth } from "angularfire2/auth";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { OneSignal } from "@ionic-native/onesignal/ngx";
import * as firebase from "firebase/app";
import { LoadingController, ToastController } from "@ionic/angular";
import { Camera, CameraOptions } from "@ionic-native/Camera/ngx";
import { FileTransfer, FileUploadOptions, FileTransferObject } from "@ionic-native/file-transfer/ngx";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage {
  constructor(
    private platform: Platform,
    private oneSignal: OneSignal,
    private firebaseauth: AngularFireAuth,
    private firestore: AngularFirestore,
    private http: HttpClient,
    public startLoad: LoadingController,
    public toasts: ToastController,
    private camera: Camera,
    public File: FileTransfer,

  ) {
    let currentDate = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    this.today = currentDate.getDate() + ' ' + monthNames[currentDate.getMonth()] + ' ' + currentDate.getFullYear()
    console.log('today is=>', this.today);

  }

  //backbutton disabled
  backDisbale = this.platform.backButton.subscribeWithPriority(999, () => {
    this.msg = 'press again to exit'
    this.presentToast()
    this.platform.backButton.subscribeWithPriority(999, () => {
      navigator["app"].exitApp();
    })
  });
  ///VARIABLES
  userID: string;
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
      .doc(this.userID)
      .valueChanges()
      .subscribe((res) => {
        this.userData = res;
        console.log('user data', this.userData);
      });

  }

  noti: boolean = false;
  showhidenoti() {
    this.noti = !this.noti;
  }
  checkNotifications() {
    console.log("checking notifications");

    this.firestore
      .collection("notifications", (q) => q.where("notificationFor", "==", this.userID))
      .valueChanges()
      .subscribe((r) => {
        if (r.length < 1) {
          this.noti = false;
          console.log("no notifications for users");
        } else {
          this.noti = true;
          console.log("users have notifications");
        }
      });
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
        console.log("image got");
      })
      .then(() => {
        this.loaderID = "clickImage";
        this.loadermsg = "uploading";
        this.presentLoading();
        console.log("uploading to server");
        this.docID = this.getDocumentID();
        const FileTransfer: FileTransferObject = this.File.create();
        let opt: FileUploadOptions = {
          fileKey: "file",
          fileName: this.docID + this.docID + ".jpg",
          headers: {},
        };
        FileTransfer.upload(this.imageData, "https://134.122.2.23/upload.php", opt)
          .then((upload) => {
            console.log(upload);
            this.clickedImage = "https://134.122.2.23/uploads/" + this.docID + this.docID + ".jpg";
            this.uploadTofirestore();
          })
          .catch((err) => {
            console.log(JSON.stringify(err));
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
    console.log('in hee');

    const docOwner = this.userID
    const uploadedat = this.today;
    const imageURL = this.clickedImage;
    const latitude = this.userData.Lattitude;
    const longitude = this.userData.Longitude;
    const uploaderImage = this.userData.ProfileImage;
    const docID = this.docID
    const timestamp = Date.now()
    const imageDocID = firebase.firestore().collection('images').doc(this.docID).collection('imageData').doc().id
    const uploadedBy = docOwner
    const upImg = this.firestore.collection('images', q => q.where('uploadedat', '==', this.today)
      .where('docOwner', '==', this.userID)).valueChanges().subscribe(d => {
        if (d.length < 1) {
          console.log('i am here',);
          upImg.unsubscribe()

          this.firestore.collection('images').doc(this.docID).set({
            docOwner,
            uploadedat,
            docID,
            images: firebase.firestore.FieldValue.arrayUnion({
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
              uploaderImage,
              timestamp,
              imageDocID,
              uploadedBy,
            }).then(() => {
              this.msg = 'Image uploaded successfully'
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
        } else {
          console.log('i am in else');

          this.temporary = d;
          this.tempdocID = this.temporary[0].docID;
          const imageDocID = firebase.firestore().collection('images').doc(this.tempdocID).collection('imageData').doc().id
          this.firestore.collection('images').doc(this.tempdocID).update({
            images: firebase.firestore.FieldValue.arrayUnion({
              imageURL,
              latitude,
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
              timestamp,
              imageDocID,
              uploadedBy,
            }).then(() => {
              this.addingtouserandpostdoc()
              this.msg = 'Image uploaded successfully'
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

    const docOwner = this.userID
    const uploadedat = this.today;
    const imageURL = this.clickedImage;
    const latitude = this.userData.Lattitude;
    const longitude = this.userData.Longitude;
    const uploaderImage = this.userData.ProfileImage;
    const timestamp = Date.now()
    const uploadedBy = docOwner
    const uploaderName = this.userData.Name
    this.firestore.collection('users').doc(this.userID).update({
      images: firebase.firestore.FieldValue.arrayUnion({
        imageURL,

      })
    })

    const docID = firebase.firestore().collection('postimages').doc().id;
    this.firestore.collection('postimages').doc(docID).set({
      imageURL,
      latitude,
      longitude,
      uploaderImage,
      timestamp,
      uploadedBy,
      docID,
      uploaderName,
    })
  }

  ionViewWillEnter() {

    this.firebaseauth.authState.subscribe((user) => {
      this.userID = user.uid;
      this.getUserdata();
      this.platform.ready().then(() => {

        if (this.platform.is("cordova") && this.userData) {
          // this.getGeolocation();
          this.checkNotifications();
        }
      });
    });

  }
}
