import { ModalController, LoadingController, ActionSheetController, ToastController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-display-shop',
  templateUrl: './display-shop.page.html',
  styleUrls: ['./display-shop.page.scss'],
})
export class DisplayShopPage implements OnInit {

  constructor(
    private modal: ModalController,
    private actionSheet: ActionSheetController,
    public toastControll: ToastController,
    private loading: LoadingController,

  ) { }
  list: boolean = false;
  editPage: boolean = false;
  collectionName: String;
  loadermsg: string;
  loaderID: string;
  msg: string;

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

  ngOnInit() {
  }

}
