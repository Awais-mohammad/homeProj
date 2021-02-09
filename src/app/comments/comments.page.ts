import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { ModalController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import * as firebase from 'firebase';


@Component({
  selector: 'app-comments',
  templateUrl: './comments.page.html',
  styleUrls: ['./comments.page.scss'],
})
export class CommentsPage implements OnInit {

  constructor(
    public afAuth: AngularFireAuth,
    public modalController: ModalController,
    private fireStore: AngularFirestore,
    public toastController: ToastController,
    public loadingController: LoadingController,
  ) { }

  @Input() ID: string;
  post: any;
  timeAgo: string;
  daysDifference: number;
  hoursDifference: number;
  minutesDifference: number;
  secondsDifference: number;
  msg: string;
  color: string;
  msg2: string;

  async presentToast() {
    const toast = await this.toastController.create({
      message: this.msg2,
      color: this.color,
      position: 'top',
      mode: 'ios',
      duration: 3000
    });
    toast.present();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  addAgos() {
    this.post.ago = this.timeCalc(this.post.time.seconds);
  }

  addAgos2() {
    for (var i = 0; i < this.post.comments.length; i++) {
      this.post.comments[i].ago = this.timeCalc(this.post.comments[i].time.seconds);
    }
  }

  timeCalc(timeThen) {
    var date2 = new Date();
    var date = timeThen;
    var difference = date2.getTime() - date * 1000;
    this.daysDifference = difference / 1000 / 60 / 60 / 24;
    this.hoursDifference = difference / 1000 / 60 / 60;
    this.minutesDifference = difference / 1000 / 60;
    this.secondsDifference = difference / 1000;
    if (this.secondsDifference < 60) {
      this.timeAgo = Math.floor(this.secondsDifference) + 's';
      return this.timeAgo;
    } else if (this.minutesDifference < 60) {
      this.timeAgo = Math.floor(this.minutesDifference) + 'm';
      return this.timeAgo;
    } else if (this.hoursDifference < 24) {
      this.timeAgo = Math.floor(this.hoursDifference) + 'h';
      return this.timeAgo;
    } else if (this.daysDifference < 7) {
      this.timeAgo = Math.floor(this.daysDifference) + 'd';
      return this.timeAgo;
    } else {
      this.timeAgo = Math.floor(this.daysDifference / 7) + 'w';
      return this.timeAgo;
    }
  }

  private sub: Subscription = new Subscription();
  name: string;

  ionViewWillEnter() {
    this.sub = this.fireStore.collection('postimages').doc(this.ID).valueChanges().subscribe((res) => {
      this.post = res;
      if (this.post.comments) {
        this.addAgos2()
      }
      console.log(this.post);
    })
    const userSub = this.fireStore.collection('users').doc(this.afAuth.auth.currentUser.uid).valueChanges().subscribe((res: any) => {
      this.name = res.Name;
      userSub.unsubscribe();
    })
  }

  addComment() {
    if (this.msg != undefined && this.msg.length > 1) {
      const msg = this.msg;
      const time = new Date();
      const name = this.name;
      this.fireStore.collection("postimages").doc(this.ID).update({
        comments: firebase.firestore.FieldValue.arrayUnion({
          msg, time, name
        })
      }).then(() => {
        this.msg = "";
      });
    } else {
      this.msg2 = "Comment too short!";
      this.color = "danger";
      this.presentToast();
    }
  }

  ionViewWillLeave() {
    this.post = undefined;
    this.sub.unsubscribe();
  }

  ngOnInit() {
  }

}