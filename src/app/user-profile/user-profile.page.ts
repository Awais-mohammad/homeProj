import { ModalController, ToastController } from "@ionic/angular";
import { Component, OnInit, Input } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import * as firebase from "firebase/app"
import { AngularFireAuth } from 'angularfire2/auth';
import { Camera, CameraOptions } from '@ionic-native/Camera/ngx';
import { Platform, AlertController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FileTransfer, FileUploadOptions, FileTransferObject } from "@ionic-native/file-transfer/ngx";
import { ImageViewerPage } from "../image-viewer/image-viewer.page";
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
})
export class UserProfilePage implements OnInit {
  @Input() UserID;
  currentImage: any;
  constructor(
    public ModalCtrl: ModalController,
    private firestore: AngularFirestore,
    public toastControll: ToastController,
    private auth: AngularFireAuth,
    private loading: LoadingController,
    private firebaseauth: AngularFireAuth,
    private camera: Camera,
    private platform: Platform,
    private http: HttpClient,
    public File: FileTransfer,
    public actionSheet: ActionSheetController,

  ) {

    let currentDate = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    this.today = currentDate.getDate() + ' ' + monthNames[currentDate.getMonth()] + ' ' + currentDate.getFullYear()
    console.log('today is=>', this.today);

  }

  backDisbale = this.platform.backButton.subscribeWithPriority(999, () => {
    this.loading.getTop().then(v => {
      if (v != null) {
        this.loading.dismiss('loll')
      }
    })
    this.closePage()

  });

  loadermsg: string;
  loaderID: string;
  msg: string;
  today: any;
  selectedPhoto: any;
  address: string;
  photoPurpose: string;
  fullpageImage: boolean = false;
  url: string;
  daysDifference: number;
  hoursDifference: number;
  minutesDifference: number;
  secondsDifference: number;
  timeAgo: string;
  userData: any;
  currentDiv: string = 'profile';
  galleryLabel: string = "none"
  publicImages: any;
  publicdisplayImages: any;

  //loading
  async presentLoading() {
    const loading = await this.loading.create({
      message: this.loadermsg,
      spinner: 'dots',
      id: this.loaderID,

    });
    await loading.present();
  }
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



  async openFullpageimage(url) {


    const model = await this.ModalCtrl.create({
      component: ImageViewerPage,
      cssClass: "my-custom-class",
      id: "viewImage",
      componentProps: {
        imageURL: url,
      },
    });
    return await model.present();


  }

  async ChoosePhotoOption(imagePurpose: string) {
    let actionSheet = this.actionSheet.create({
      header: "Options",
      buttons: [
        {
          text: 'Take photo',
          role: 'destructive',
          icon: 'camera-outline',
          handler: () => {
            this.capture(imagePurpose);
          }
        },
        {
          text: 'Choose photo from Gallery',
          icon: 'image-outline',
          handler: () => {
            this.openGallery(imagePurpose);
          }
        },
      ]
    });
    (await actionSheet).present();
  }


  switchViews(divType: string, gtyp: string) {


    if (divType == 'profile' && gtyp == 'none') {
      this.currentDiv = 'profile'



    }
    else if (divType == 'gallery' && gtyp == 'public') {
      this.currentDiv = 'gallery'
      this.galleryLabel = 'PUBLIC'

    }
    else if (divType == 'gallery' && gtyp == 'private') {
      this.currentDiv = 'gallery'
      this.galleryLabel = 'PRIVATE'

    }

  }
  closePage() {
    this.ModalCtrl.dismiss('chatbox')
  }

  follow() {
    const userID = this.currentuserID;
    const time = Date.now()
    this.firestore.collection('users').doc(this.UserID).update({
      followers: firebase.firestore.FieldValue.arrayUnion({
        userID,
        time,
      })
    }).then(() => {
      const userID = this.UserID

      this.firestore.collection('users').doc(this.currentuserID).update({
        following: firebase.firestore.FieldValue.arrayUnion({
          userID,
          time,
        })
      }).then(() => {
        const playerID = this.userData.deviceID
        const message = this.currentUserdata.Name + ' ' + 'started followig you'

        this.sendNotification(message, playerID)
        this.checkFollow()
      })
    })
  }
  foollow: boolean = false;

  checkFollow() {

    if (this.currentUserdata.following) {
      for (var i = 0; i < this.currentUserdata.following.length; i++) {

        if (this.UserID == this.currentUserdata.following[i].userID) {
          this.foollow = true

        }
        else {
          this.foollow = false;
        }
      }
    }
    else {

    }
  }

  sendNotification(content, playerID) {

    var header = new HttpHeaders();
    header.append("Content-Type", "application/json");


    return this.http
      .post(
        "http://134.122.2.23/useruserpush.php",
        {
          message: content,
          playerID: playerID,
        },
        { headers: header, responseType: "text" }
      )
      .subscribe(
        (resp) => {

        },
        (error) => { }
      );

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
  imageData: any;
  imageID: string;


  temp1: number;
  temp2: number;
  temp3: number;
  getuserData() {
    this.firestore.collection('users').doc(this.UserID).valueChanges().subscribe(res => {
      this.userData = res
      if (this.userData.following) {
        for (var i = 0; i < this.userData.following.length; i++) {

          this.temp3 = i + 1
        }
      }
      else {


      }
      if (!this.userData.images) {

      }
      else {
        for (var i = 0; i < this.userData.images.length; i++) {

          this.temp1 = i + 1
        }

      }
      if (this.userData.followers) {
        for (var i = 0; i < this.userData.followers.length; i++) {

          this.temp2 = i + 1
        }
      }
      else {


      }

    })
  }

  getImages() {
    this.firestore.collection('images', qu => qu.where('docOwner', '==', this.UserID).orderBy('uploadedat', 'desc')).valueChanges().subscribe(res => {
      if (res.length < 1) {

        this.publicImages = null
      }
      else {

        this.publicImages = res

        this.publicdisplayImages = this.publicImages[0]

      }

    })
  }
  imagesData: any;
  getImaages() {

    this.firestore.collection('images', querry => querry.where('docOwner', '==', this.UserID).orderBy('uploadedat', 'asc')).valueChanges().subscribe(res => {
      if (res.length < 1) {


      }
      else {

        this.imagesData = res

      }
    })

  }
  docID: string;
  getDocumentID(typ) {
    if (typ == 'public') {
      const docID = firebase.firestore().collection('images').doc().id;
      return docID
    }
    else if (typ == 'private') {
      const docID = firebase.firestore().collection('users').doc(this.UserID).collection('privateimages').doc().id
      return docID

    }
  }
  clickedImage: string;


  openGallery(type) {
    const optionsGallery: CameraOptions = {
      quality: 60,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,

    }
    this.camera.getPicture(optionsGallery).then((imageData) => {
      this.imageData = imageData;
      this.msg = "Fetching Image this may take few seconds"
      this.presentToast();
      this.uploadtoServer(type)
    }, (err) => {
      this.msg = "Unable to Open gallery please use camera "
      this.presentToast();

    }).then(() => {

    })
  }

  capture(type) {


    let options = {
      quality: 60,
      targetHeight: 1200,
      correctOrientation: true,
    };
    this.camera
      .getPicture(options)
      .then((img) => {
        this.imageData = img;

        this.uploadtoServer(type)
        console.log(type, 'type');

      });
  }
  uploadtoServer(typ) {
    if (typ == 'profile') {

      this.loaderID = 'clickImage'
      this.loadermsg = 'Uploading'
      this.presentLoading()
      this.docID = this.getDocumentID(typ)
      const FileTransfer: FileTransferObject = this.File.create();
      let opt: FileUploadOptions = {
        fileKey: "file",
        fileName: this.UserID + ".jpg",
        headers: {},
      };
      FileTransfer.upload(this.imageData, "http://134.122.2.23/upload.php", opt)
        .then((upload) => {

          this.clickedImage = "http://134.122.2.23/uploads/" + this.UserID + '.jpg?random+\=' + Math.random();
          const ProfileImage = this.clickedImage
          this.firestore.collection('users').doc(this.UserID).update({
            ProfileImage,
          })
          console.log(upload);

        }).then(() => {
          this.loading.dismiss('clickImage')
          this.msg = 'Image updated'
          this.presentToast()
        }).catch(() => {
          this.loading.dismiss('clickImage')
          this.msg = 'Something went wrong please retry'
          this.presentToast()
        })

    }
    else if (typ == 'public') {
      this.loaderID = 'clickImage'
      this.loadermsg = 'Uploading'
      this.presentLoading()
      this.docID = this.getDocumentID(typ)
      const FileTransfer: FileTransferObject = this.File.create();
      let opt: FileUploadOptions = {
        fileKey: "file",
        fileName: this.docID + this.docID + ".jpg",
        headers: {},
      };
      FileTransfer.upload(this.imageData, "http://134.122.2.23/upload.php", opt)
        .then((upload) => {

          this.clickedImage = "http://134.122.2.23/uploads/" + this.docID + this.docID + '.jpg';
          this.uploadTofirestore()
        })
    }
    else if (typ == 'private') {
      this.loaderID = 'clickImage'
      this.loadermsg = 'Uploading'
      this.presentLoading()
      this.docID = this.getDocumentID(typ)
      const FileTransfer: FileTransferObject = this.File.create();
      let opt: FileUploadOptions = {
        fileKey: "file",
        fileName: this.docID + ".jpg",
        headers: {},
      };
      FileTransfer.upload(this.imageData, "http://134.122.2.23/upload.php", opt)
        .then((upload) => {

          this.clickedImage = "http://134.122.2.23/uploads/" + this.docID + '.jpg';

        }).then(() => {
          const imageURL = this.clickedImage;
          const latitude = this.userData.Lattitude
          const longitude = this.userData.Longitude
          const timestamp = Date.now()
          const uploaderImage = this.userData.ProfileImage

          this.firestore.collection('users').doc(this.UserID).collection('privateimages').doc(this.docID).set({
            imageURL,
            latitude,
            longitude,
            timestamp,
            uploaderImage,
          })
        }).then(() => {
          const imageURL = this.clickedImage;
          const timestamp = Date.now()
          this.firestore.collection('users').doc(this.UserID).update({
            images: firebase.firestore.FieldValue.arrayUnion({
              imageURL,
              timestamp
            })
          })
        })
        .then(() => {
          this.loading.dismiss("clickImage");
          this.msg = 'Image uploaded'
          this.presentToast()

        })
        .catch((err) => {

          this.loading.dismiss("clickImage");
        });

    }
  }
  tempdocID: string;
  temporary: any;

  uploadTofirestore() {


    const docOwner = this.UserID
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
      .where('docOwner', '==', this.UserID)).valueChanges().subscribe(d => {
        if (d.length < 1) {

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

            })
              .then(() => {
                this.addingtouserandpostdoc()
                this.msg = 'Image uploaded successfully'
                this.presentToast()
                this.loading.getTop().then(v => {
                  if (v != null) {
                    this.loading.dismiss("clickImage");
                  }
                })
              }).catch(() => {
                this.msg = 'Failed to upload RETRY'
                this.presentToast()
                this.loading.getTop().then(v => {
                  if (v != null) {
                    this.loading.dismiss("clickImage");
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
              this.loading.getTop().then(v => {
                if (v != null) {
                  this.loading.dismiss("clickImage");
                }
              })
            }).catch(() => {
              this.msg = 'Failed to upload RETRY'
              this.presentToast()
              this.loading.getTop().then(v => {
                if (v != null) {
                  this.loading.dismiss("clickImage");
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
    const uploaderName = this.userData.Name
    const uploadedBy = docOwner

    this.firestore.collection('users').doc(this.currentuserID).update({
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
  privateImages: any;
  getprivateImages() {
    this.firestore.collection('users').doc(this.UserID).collection('privateimages').valueChanges().subscribe(res => {
      if (res.length < 1) {
        this.privateImages = null
      }
      else {
        this.privateImages = res;
      }


    })
  }

  currentuserID: string;
  otheruser: boolean = false;
  currentUserdata: any;

  ionViewWillEnter() {

    this.getuserData()
    this.getImaages()
    this.getprivateImages()
    this.firebaseauth.authState.subscribe(u => {
      this.currentuserID = u.uid

      this.firestore.collection('users').doc(this.currentuserID).valueChanges().subscribe(res => {

        this.currentUserdata = res;
        this.checkFollow()
      })

    })

    this.getImages()

  }

  ionViewWillLeave() {

  }

  ngOnInit() {
    this.loaderID = 'loll'
    this.loadermsg = 'Loading'
    this.presentLoading()
    setTimeout(() => {
      this.loading.dismiss('loll')
    }, 3000);
  }
} 
