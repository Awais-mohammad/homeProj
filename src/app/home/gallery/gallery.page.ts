import { ImageViewerPage } from './../../image-viewer/image-viewer.page';
import { Component, OnInit } from "@angular/core";
import { AngularFirestore, AngularFirestoreCollection } from "@angular/fire/firestore";
import { AngularFireAuth } from "angularfire2/auth";
import { LoadingController, ModalController } from "@ionic/angular";

@Component({
  selector: "app-gallery",
  templateUrl: "./gallery.page.html",
  styleUrls: ["./gallery.page.scss"],
})
export class GalleryPage implements OnInit {
  constructor(
    private firestore: AngularFirestore,
    private firebaseauth: AngularFireAuth,
    public loadingController: LoadingController,
    public ModalCtrl: ModalController,
  ) { }

  loadermsg: string;
  loaderID: string;

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: this.loadermsg,
      spinner: "dots",
      id: this.loaderID,
      cssClass: 'custom-loading',
      translucent: true,
      showBackdrop: false,
      mode: 'md',
      keyboardClose: true
    });
    await loading.present();
  }

  doRefresh(event) {
    console.log("Begin async operation");

    setTimeout(() => {
      console.log("Async operation has ended");
      event.target.complete();

    }, 2000);
  }
  userID: string;
  imagesData: any;
  getImages() {
    console.log('kld');

    this.loaderID = 'lol'
    this.loadermsg = 'LOADING'
    this.presentLoading()
    this.firestore.collection('images', querry => querry.where('docOwner', '==', this.userID).orderBy('uploadedat', 'asc')).valueChanges().subscribe(res => {
      if (res.length < 1) {
        console.log('no images by user');
        this.loadingController.dismiss('lol')
      }
      else {
        console.log('images', res);
        this.imagesData = res
        console.log('jkdhoseg>', this.imagesData)
        this.loadingController.dismiss('lol')
      }

    })

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


  ionViewWillEnter() {


  }

  ionViewWillLeave() {

  }
  ngOnInit() {
    const authsub = this.firebaseauth.authState.subscribe(user => {
      this.userID = user.uid
      this.getImages()
      console.log(user.uid);

    })
  }
}
