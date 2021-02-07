import { Component, OnInit } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import * as firebase from 'firebase/app'

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})

export class NotificationsPage implements OnInit {


  constructor(
    private storage: AngularFireStorage,
    private firebaseauth: AngularFireAuth,
    private firestore: AngularFirestore,
    private http: HttpClient,
    private oneSignal: OneSignal,

  ) {

  }
  userData: any;
  generateKey(name) {
    const key = firebase.firestore().collection(name).doc().id
    return key;
  }
  sendData() {
    this.firestore.collection('users').doc(this.userID).get().subscribe(res => {
      console.log('data=>', res);
      this.userData = res;
      console.log('Df.sn.proto.mapValue.fields.deviceID', this.userData.Df.sn.proto.mapValue.fields.deviceID.stringValue);

    })

    const docID = this.generateKey('notifications')
    const message = 'hi how are you'
    const sentAt = Date.now()
    const sentBy = this.userData.Df.sn.proto.mapValue.fields.Name.stringValue
    const notificationFor = this.userID
    if (!this.userData.Df.sn.proto.mapValue.fields.ProfileImage.stringValue
    ) {
      const senderImage = "https://cdn1.iconfinder.com/data/icons/circle-outlines-colored/512/Send_Paper_Plane_Document_Message_Communication-128.png"
      this.firestore.collection('notifications').doc(docID).set({
        senderImage,
        message,
        sentAt,
        sentBy,
        notificationFor,
      }).then(() => {
        console.log('notification sent successfully');

      }).catch(err => {
        console.log('err in noti=>', err);

      })
    }
    else {
      const senderImage = this.userData.Df.sn.proto.mapValue.fields.ProfileImage.stringValue
      this.firestore.collection('notifications').doc(docID).set({
        senderImage,
        message,
        sentAt,
        sentBy,
        notificationFor,
      }).then(() => {
        console.log('notification sent successfully');

      }).catch(err => {
        console.log('err in noti=>', err);

      })
    }

    var header = new HttpHeaders();
    header.append('Content-Type', 'application/json');

    return this.http.post('http://178.128.67.27/finalapi.php', {
      message: this.userData.Df.sn.proto.mapValue.fields.Name.stringValue + message,
      playerID: this.userData.Df.sn.proto.mapValue.fields.deviceID.stringValue,
    }, { headers: header, responseType: 'text' }).subscribe(resp => {
      alert("this is the response" + resp);
    }, (error) => {
      alert("not again " + JSON.stringify(error));
    })

  }
  userID: string;
  notification: any;
  getNotifications() {
    if (!this.userID) {
      const authsub = this.firebaseauth.authState.subscribe(user => {
        this.userID = user.uid;
        this.getNotifications()
      })
    } else {
      this.firestore.collection('notifications', querry => querry.where('notificationFor', '==', this.userID).orderBy("sentAt", "desc")).valueChanges().subscribe(datanoti => {
        if (datanoti.length < 1) {
          this.notification = null;
          console.log('no notifications');

        }
        else {
          this.notification = datanoti
          console.log('notifications', this.notification);

        }
      })

    }
  }
  daysDifference: number;
  hoursDifference: number;
  minutesDifference: number;
  secondsDifference: number;
  timeAgo: string;

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

 

  ionViewWillEnter() {
    if (!this.userID) {
      this.firebaseauth.authState.subscribe(user => {
        this.userID = user.uid;
      })
    }
    this.getNotifications()
  }

  ionViewWillLeave() {
    this.userID = null
  }

  ngOnInit() {

  }
}
