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
import { AdMobFree, AdMobFreeBannerConfig, AdMobFreeInterstitialConfig } from '@ionic-native/admob-free/ngx';

@Component({
  selector: "app-feed",
  templateUrl: "./feed.page.html",
  styleUrls: ["./feed.page.scss"],
})
export class FeedPage implements OnInit {
  constructor(
    private firestore: AngularFirestore,
    public toastControll: ToastController,
    private loading: LoadingController,
    private firebaseauth: AngularFireAuth,
    private router: Router,
    private http: HttpClient,
    private storage: AngularFireStorage,
    private camera: Camera,
    public File: FileTransfer,
    public modal: ModalController,
    public onesignal: OneSignal,
    public admob: AdMobFree,

  ) {
    let currentDate = new Date();
    let weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    this.today = weekdays[currentDate.getDay()];
    console.log("today-->", this.today);
  }
  currentUserID: string;
  posts: any;
  userData: any;
  loadermsg: string;
  loaderID: string;
  msg: string;
  today: any;
  selectedPhoto: any;

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

  async openProfileModal(uploadedBy) {
    console.log(uploadedBy, "sending it");

    const model = await this.modal.create({
      component: UserProfilePage,
      cssClass: "my-custom-class",
      id: "userprofile",
      componentProps: {
        UserID: uploadedBy,
      },
    });
    return await model.present();
  }

  async testmodal() {


    const model = await this.modal.create({
      component: DisplayShopPage,
      cssClass: "my-custom-class",
      id: "displayshop",
      componentProps: {

      },
    });
    return await model.present();
  }


  doRefresh(event) {
    console.log("Begin async operation");

    setTimeout(() => {
      console.log("Async operation has ended");
      event.target.complete();
      this.getPosts();
    }, 2000);
  }

  getPosts() {
    this.loaderID = 'lolo'
    this.loadermsg = 'LOADING'
    this.presentLoading()
    const time = new Date();
    console.log(time);

    this.firestore.collection("postimages", (querry) => querry.orderBy("timestamp", "desc"))
      .valueChanges()
      .subscribe((post) => {
        if (post.length < 1) {
          console.log("no images for user");

        } else {
          console.log(post, "imges");
          this.posts = post;

          for (var i = 0; i < this.posts.length; i++) {
            if (this.posts[i].likes)
              for (var j = 0; j < this.posts[i].likes.length; j++) {
                if (this.posts[i].likes[j].LikedBy == this.currentUserID) {
                  this.posts[i].Liked = true;
                } else {
                  this.posts[i].Liked = false;
                }
              }
          }
        }
        this.loading.dismiss('lolo')
      });

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
          console.log(resp);
        },
        (error) => { }
      );

  }

  UserData: any;
  daysDifference: number;
  hoursDifference: number;
  minutesDifference: number;
  secondsDifference: number;
  timeAgo: string;
  latitude: number;
  longitude: number;
  accuracy: number;

  timeCalc(timeThen) {
    var date2 = new Date();
    var difference = date2.getTime() - timeThen;
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
  Liked: boolean = false;



  uploaderData: any;
  playerID: any;



  addLike(posst) {
    console.log(posst, "to add like");
    const LikedBy = this.currentUserID;
    const likerName = this.userData.Df.sn.proto.mapValue.fields.Name.stringValue;
    this.firestore
      .collection("postimages")
      .doc(posst.docID)
      .update({
        likes: firebase.firestore.FieldValue.arrayUnion({
          LikedBy,
          likerName,
        }),
      })
      .then(() => {
        this.firestore
          .collection("users")
          .doc(posst.uploadedBy)
          .valueChanges()
          .subscribe((UploaderData) => {
            this.uploaderData = UploaderData;
            console.log("uploaderrr", this.uploaderData.deviceID);
            this.playerID = this.uploaderData.deviceID;
            const message = this.userData.Df.sn.proto.mapValue.fields.Name.stringValue + ' Liked your photo'
            const playerID = this.playerID
            this.sendNotification(message, playerID)
          });

      })
      .then(() => {
        const docID = firebase.firestore().collection("notifications").doc().id;
        const message = this.userData.Df.sn.proto.mapValue.fields.Name.stringValue + " Liked your photo";
        const notificationFor = posst.uploadedBy;
        const sentAt = Date.now();
        const sentBy = this.userData.Df.sn.proto.mapValue.fields.userID.stringValue;
        this.firestore.collection("notifications").doc(docID).set({
          docID,
          message,
          notificationFor,
          sentAt,
          sentBy,
        });
      })
      .then(() => {
        this.checkIndiviualPostLike(posst)
        this.msg = "Image Liked";
        this.presentToast();
      });
  }

  checkIndiviualPostLike(post) {
    if (post.likes) {
      for (var i = 0; i < post.likes.length; i++) {
        if (post.likes[i].LikedBy == this.currentUserID) {
          post.Liked = true
        }
      }
    }
  }

  upim: string;

  shareImage(post) {
    console.log("post to share->", post);

    this.upim = this.userData.Df.sn.proto.mapValue.fields.ProfileImage.stringValue;
    const docID = firebase.firestore().collection("images").doc().id;
    const imageURL = post.imageURL;
    const uploaderImage = this.upim;
    const latitude = post.latitude;
    const longitude = post.longitude;
    const timestamp = Date.now();
    const tag = "private";
    const uploadedFrom = post.uploadedFrom;
    const uploaderName = this.userData.Df.sn.proto.mapValue.fields.Name.stringValue;
    const uploadedat = post.uploadedat;
    const uploadedBy = this.userData.Df.sn.proto.mapValue.fields.userID.stringValue;
    console.log(imageURL + docID + uploaderImage + latitude + longitude);

    this.firestore
      .collection("images")
      .doc(docID)
      .set({
        docID,
        imageURL,
        uploaderImage,
        latitude,
        longitude,
        timestamp,
        tag,
        uploaderName,
        uploadedFrom,
        uploadedat,
        uploadedBy,
      })
      .then(() => {
        console.log("uploadedBy->", post.uploadedBy);

        this.firestore
          .collection("users")
          .doc(post.uploadedBy)
          .valueChanges()
          .subscribe((UploaderData) => {
            this.uploaderData = UploaderData;
            console.log(UploaderData, "aatattata");
            this.playerID = this.uploaderData.deviceID;
            const content = this.userData.Df.sn.proto.mapValue.fields.Name.stringValue + ' saved your image'
            const deviceID = this.playerID
            this.sendNotification(content, deviceID)

          });
      });
  }
  showBanner() {
    console.log('banner for adds');

    let bannerConfig: AdMobFreeBannerConfig = {

      autoShow: true,
      id: 'ca-app-pub-5604699543980819/8680152797'

    };

    this.admob.banner.config(bannerConfig);

    this.admob.banner.prepare().then((e) => {
      console.log('edd mob=>', e);

    }).catch(e => console.log(e));

  }

  ionViewWillEnter() {
    this.showBanner()
    if (!this.posts) {
      this.firebaseauth.authState.subscribe((u) => {
        this.currentUserID = u.uid;
        this.getPosts();
        this.firestore
          .collection("users")
          .doc(u.uid)
          .get()
          .subscribe((userdata) => {
            this.userData = userdata;
            console.log(userdata);
          });
      });
    }
  }

  ngOnInit() {

  }
}