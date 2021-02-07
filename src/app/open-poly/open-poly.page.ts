import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController } from "@ionic/angular";
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import * as firebase from "firebase/app"
import { AngularFireAuth } from 'angularfire2/auth';


@Component({
  selector: 'app-open-poly',
  templateUrl: './open-poly.page.html',
  styleUrls: ['./open-poly.page.scss'],
})
export class OpenPolyPage implements OnInit {
  @Input() polygon;
  @Input() images;
  constructor(
    public ModalCtrl: ModalController,
    private firestore: AngularFirestore,
    public toastControll: ToastController,
    private auth: AngularFireAuth,
    private firebaseauth: AngularFireAuth,

  ) { }

  closePage() {
    this.ModalCtrl.dismiss('polygonDetails')
  }


  ngOnInit() {
    console.log('num', this.polygon);
    if (!this.polygon) {
      this.polygon = '0'
    }

  }

}
