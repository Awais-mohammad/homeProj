import { DisplayShopPage } from './../../display-shop/display-shop.page';
import { UserProfilePage } from './../../user-profile/user-profile.page';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, ModalController } from '@ionic/angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';
import * as firebase from 'firebase/app'


@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  searchedName: string;
  constructor(
    private router: Router,
    public loadingController: LoadingController,
    public toastControll: ToastController,
    private firebaseauth: AngularFireAuth,
    private firestore: AngularFirestore,
    public alertController: AlertController,
    public ModalCtrl: ModalController,

  ) { }
  loaderID: string;
  loadermsg: string;
  msg: string;
  name: string;
  phone: number;
  adress: String;
  currentDiv: string = 'menu';
  showSearchBar: boolean = false;
  shopdata: any;

  //loading
  async presentLoading() {
    const loading = await this.loadingController.create({
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
  async logout() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Confirm',
      message: 'Are you sure you want to logout',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',


        }, {
          text: 'Confirm',
          handler: () => {
            this.firebaseauth.auth.signOut();
            this.router.navigate(['authentication'])
          }
        }
      ]
    });


    await alert.present();
  }
  currentUserID: string;
  newPassword: string;
  async updatePassword() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Enter new password',
      mode: 'ios',
      inputs: [
        {
          name: 'newpassword',
          type: 'text',
          placeholder: 'Enter new password'
        },

      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'UPDATE',
          handler: (alertData) => {
            console.log("alertData.newpassword", alertData.newpassword);
            this.newPassword = alertData.newpassword;
            if (this.newPassword.length < 8) {
              this.msg = 'password must be of 8 digits or above'
              this.presentToast();
            }
            else {
              this.firebaseauth.auth.currentUser.updatePassword(this.newPassword).then(() => {
                this.loadermsg = 'updating password'
                this.loaderID = 'uppas'
                this.presentLoading();
                setTimeout(() => {
                  this.loadingController.getTop().then((l) => {
                    if (l != null) {
                      this.loadingController.dismiss('uppas')
                    }
                  })

                  const userID = this.currentUserID
                  const Password = this.newPassword
                  this.firestore.collection('users').doc(this.currentUserID).update({
                    Password
                  }).then(() => {
                    this.msg = 'password updated successfully'
                    this.presentToast();
                  })
                }, 2000);

              }).catch(() => {
                setTimeout(() => {
                  this.loadingController.getTop().then((l) => {
                    if (l != null) {
                      this.loadingController.dismiss('uppas')
                    }
                  })
                  this.msg = 'Unable to perform operation Login again and try'
                  this.presentToast();
                }, 2000);
                setTimeout(() => {
                  this.firebaseauth.auth.signOut();
                }, 1000);
              })
            }
          }
        }
      ]
    });

    await alert.present();
  }



  async openProfileModal(uid) {

    if (!uid) {
      const authSub = this.firebaseauth.authState.subscribe(res => {
        this.currentUserID = res.uid;
        this.openProfileModal(res.uid);
      })

    } else {
      const model = await this.ModalCtrl.create({
        component: UserProfilePage,
        cssClass: "my-custom-class",
        id: "userprofile",
        componentProps: {
          UserID: uid,
        },
      });
      return await model.present();
    }

  }

  async opendisplayshoppage(pageID) {
    const model = await this.ModalCtrl.create({
      component: DisplayShopPage,
      cssClass: "my-custom-class",
      id: "displayshop",
      componentProps: {
        PageID: pageID,
      },
    });
    return await model.present();


  }

  showHideSearchBar(mgf) {
    this.showSearchBar = !this.showSearchBar;
    this.searchResults = null;
    this.searchedName = ''
  }

  userData: any;
  getUserData(uid: string) {
    this.firestore.collection('users').doc(uid).valueChanges().subscribe(res => {
      this.userData = res;
      console.log("this.userData", this.userData);

    })
  }
  report: string;
  async bug() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'What is the issue faced?',
      mode: 'ios',
      inputs: [
        {
          name: 'bugreport',
          type: 'text',
          placeholder: 'A complete detail on bug'
        },

      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'SUBMIT',
          handler: (alertData) => {
            console.log("alertData.newpassword", alertData.bugreport);
            this.report = alertData.bugreport;
            if (!this.report) {
              this.msg = 'Input in required'
              this.presentToast();
              this.bug();
            }
            else {
              this.reportBug();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  generatedoc(collectionName: string) {
    const Id = firebase.firestore().collection(collectionName).doc().id;
    return Id;
  }

  reportBug() {
    const docID = this.generatedoc('requests');
    if (!this.userData) {
      this.getUserData(this.currentUserID);
      console.log('heer');
      this.reportBug();
    }
    else {
      console.log('here');

      const Name = this.userData.Name;
      const Email = this.userData.Email;
      const Report = this.report;
      const reportedAt = Date.now();
      const reportedBy = this.currentUserID;
      this.firestore.collection('requests').doc(docID).set({
        Name,
        Email,
        Report,
        reportedAt,
        docID,
        reportedBy,
      }).then(() => {
        this.msg = 'your bug report is sent our representatives will get back to you'
        this.presentToast();
      }).catch((error) => {
        this.msg =
          JSON.stringify(error);
        this.presentToast();
      })

    }

  }

  requestRole(joinas: string) {
    if (this.userRequest) {
      this.msg = 'A request is already submitted'
      this.presentToast();
    } else {
      if (!this.userData) {
        this.getUserData(this.currentUserID);
        this.requestRole(joinas);
      }
      else {
        if (joinas == 'moderator') {
          var joinAss = 'moderator'
        }
        else {
          var joinAss = 'supermoderator'
        }
        const requesterID = this.currentUserID
        const docID = this.generatedoc('requests')
        const requestedAt = Date.now();
        const Name = this.userData.Name;
        const Email = this.userData.Email;
        const joinAs = joinAss;
        if (!this.userData) {
          this.getUserData(this.currentUserID);
          console.log('heer');
        }
        else {
          this.firestore.collection('requests').doc(docID).set({
            docID,
            Name,
            requestedAt,
            Email,
            requesterID,
            joinAs,
          }).then(() => {
            this.msg = 'your request have been submitted, Allow 2-3 business days'
            this.presentToast();
          }).catch((error) => {
            this.msg =
              JSON.stringify(error);
            this.presentToast();
          })

        }
      }
    }

  }
  userRequest: boolean = false;

  checkUserrequest(uid: string) {
    this.firestore.collection('requests', querry => querry.where("requesterID", "==", this.currentUserID)).valueChanges().subscribe(res => {
      if (res.length < 1) {

      }
      else {
        this.userRequest = true;
      }
      console.log(this.userRequest);

    })
  }

  vendorRegistration() {
    const docID = firebase.firestore().collection('requests').doc().id
    const requesterID = this.currentUserID
    const requestedAt = Date.now();
    const Name = this.userData.Name;
    const Email = this.userData.Email;
    const joinAs = 'vendor';
    this.firestore.collection('requests').doc(docID).set({
      docID,
      requesterID,
      requestedAt,
      Name,
      Email,
      joinAs,
    }).then(() => {
      this.msg = 'You request to has been submitted'
      this.presentToast();
    }).catch(() => {
      this.msg = 'There was an error submitting request check back later'
      this.presentToast();
    })
  }
  updateprof() {
    const Name = this.name
    const Phone = this.phone
    const Adress = this.adress

    this.firestore.collection('users').doc(this.currentUserID).update({
      Name,
      Phone,
      Adress,
    }).then(() => {
      this.currentDiv = 'menu'
      this.msg = 'data updated'
      this.presentToast()
      this.changecurrentDisplay('menu')
    })
  }

  changecurrentDisplay(option: string) {
    console.log("in here", this.currentDiv);
    if (option == 'menu') {
      this.currentDiv = 'menu'
    }
    else if (option == 'editProfile') {
      this.currentDiv = 'editProfile'
    }
    else if (option == 'dispshop') {
      this.currentDiv = 'displayShop'
      this.creationStatus = 'initial'
    }
  }

  gotoActivities() {
    this.router.navigate(['home/feed'])
  }
  creationStatus: string;
  shopName: string
  shopDescription: string;

  displaySHopCreation(divName) {
    if (divName == 'initial') {
      this.creationStatus = 'initial'
      this.currentDiv = 'displayShop'
    }
    else if (divName == 'second') {
      if (!this.shopName) {
        this.msg = 'Name cannot be empty'
        this.presentToast()
        this.creationStatus = 'initial'
        this.currentDiv = 'displayShop'
      }
      else {
        this.creationStatus = 'second'
        this.currentDiv = 'displayShop'
      }
    }
    else if (divName == 'third') {
      if (!this.shopDescription) {
        this.msg = 'Description cannot be empty'
        this.presentToast()
        this.creationStatus = 'second'
        this.currentDiv = 'displayShop'
      }
      else {
        this.registerShop()
      }
    }

  }

  registerShop() {
    const Name = this.shopName
    const Description = this.shopDescription
    const Adress = this.userData.Adress
    const lattitude = this.userData.Lattitude
    const longitude = this.userData.Longitude
    const OwnerID = this.currentUserID
    const RegisteredAt = Date.now()
    const Email = this.userData.Email
    const ProfileImage = 'https://img.icons8.com/pastel-glyph/2x/shop.png'
    const docID = firebase.firestore().collection('shops').doc().id
    this.firestore.collection('shops').doc(docID).set({
      Name,
      Description,
      Adress,
      lattitude,
      longitude,
      Email,
      RegisteredAt,
      OwnerID,
      docID,
      ProfileImage,
    }).then(() => {
      this.msg = 'Shop created'
      this.presentToast()
      this.currentDiv = 'menu'
    })
  }
  shop: any;
  async deleteAccount() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Are you sure',
      message: 'Once you delete your account there is no going back',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',


        }, {
          text: 'Confirm',
          handler: () => {
            this.msg = 'Your account has been permanently deleted'
            this.presentToast();
            setTimeout(() => {
              var user = firebase.auth().currentUser;
              this.firebaseauth.auth.currentUser.delete().then(() => {
                this.router.navigate(['authentication'])
                this.msg = 'We surely will miss your presence'
                this.presentToast();

              }).catch(() => {
                this.msg = 'Something went wrong please retry'
                this.presentToast();
              })
            }, 2000);

          }
        }
      ]
    });


    await alert.present();
  }

  searchResults: any;

  searchUser(filter) {
    if (!this.searchedName) {

    }
    else if (!filter) {

    }
    else {
      this.searchedName = this.searchedName.toLocaleUpperCase()
      this.firestore.collection(filter, cond => cond.where("Name", ">=", this.searchedName).where("Name", "<=", this.searchedName + '\uf8ff')).valueChanges().subscribe(data => {
        if (data.length < 1) {
          this.msg = 'Record not found'
          this.presentToast()

        }
        else {
          this.searchResults = data;
          console.log(this.searchResults, "wgw");

        }
      })
    }
  }


  getshops() {
    this.firestore.collection('shops', querr => querr.where('OwnerID', '==', this.currentUserID)).valueChanges().subscribe(res => {
      if (res.length < 1) {
        console.log('user dont have any shop');

      }
      else {
        console.log('shops=>', res);
        this.shopdata = res;
      }

    })
  }

  ionViewWillLeave() {
    this.userData = null;
    this.currentUserID = null;
    this.showSearchBar = false;
    this.searchResults = null;
    this.searchedName = ''
  }

  ionViewWillEnter() {
    console.log('page enterred');

    this.showSearchBar = false;
    this.searchResults = null;
    this.searchedName = ''
    if (!this.currentUserID) {
      const subscribe = this.firebaseauth.authState.subscribe(user => {
        this.currentUserID = user.uid
        this.getUserData(this.currentUserID);
        this.checkUserrequest(this.currentUserID)

        subscribe.unsubscribe();
      })
    }
    else {
      this.currentUserID = this.firebaseauth.auth.currentUser.uid;
      this.getUserData(this.currentUserID);
      this.checkUserrequest(this.currentUserID)

    }
  }

  ngOnInit() {

    if (!this.currentUserID) {
      const subscribe = this.firebaseauth.authState.subscribe(user => {
        this.currentUserID = user.uid
        this.getUserData(this.currentUserID);
        this.checkUserrequest(this.currentUserID)
        this.getshops()
        subscribe.unsubscribe();
      })
    }
    else {
      this.currentUserID = this.firebaseauth.auth.currentUser.uid;
      this.getUserData(this.currentUserID);
      this.checkUserrequest(this.currentUserID)
      this.getshops()
    }

  }

}
