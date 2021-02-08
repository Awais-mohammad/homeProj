import { Platform } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';
import { OneSignal } from '@ionic-native/onesignal/ngx';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.page.html',
  styleUrls: ['./authentication.page.scss'],
})
export class AuthenticationPage implements OnInit {

  constructor(
    private router: Router,
    public loadingController: LoadingController,
    public toastControll: ToastController,
    private firebaseauth: AngularFireAuth,
    private firestore: AngularFirestore,
    public alertController: AlertController,
    private oneSignal: OneSignal,
    private platform: Platform,

  ) { }
  backDisbale = this.platform.backButton.subscribeWithPriority(999, () => {
    this.msg = 'press again to exit'
    this.presentToast()
    this.platform.backButton.subscribeWithPriority(999, () => {
      navigator["app"].exitApp();
    })
  });
  currentPage: boolean = false;
  loadermsg: string;
  loaderID: string;
  email: string;
  phone: number;
  password: string;
  name: string;
  adress: string;
  showPass: boolean = false;
  type: string = 'password';
  msg: string;
  userEmail: string;
  userPassword: string;

  //loading
  async presentLoading() {
    const loading = await this.loadingController.create({
      message: this.loadermsg,
      spinner: 'dots',
      id: this.loaderID,
      mode:"ios",

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
  async showAlert() {
    const alert = await this.alertController.create({
      mode: 'ios',
      header: 'Verify Your Email',
      message: 'Looks like you have not verified your email.Check your mailbox and verify email',
      buttons: ['OK']
    });

    await alert.present();
  }
  //toggle between login and signup
  changeMainDiv() {
    this.type = 'password';
    this.showPass = false;
    this.currentPage = !this.currentPage;
    if (!this.currentPage) {
      console.log("current div is login page");

    }
    else {
      console.log("current div is signup page");

    }
  }

  //passwordtoggler
  showPassword() {
    this.showPass = !this.showPass;
    if (this.showPass) {
      this.type = 'text';
    } else {
      this.type = 'password';
    }
  }

  RouteHome() {

    setTimeout(() => {
      this.loadingController.dismiss('goHome')
      this.router.navigate(['home/menu'])
    }, 3000);

  }
  deviceID: string;
  validatesignupForm() {

    if (this.email) {
      this.email = this.email.toLocaleLowerCase();
    }

    if (!this.name) {
      this.msg = "Name cannot be left blank"
      this.presentToast();
    }
    else if (this.phone == null) {
      this.msg = "Phone cannot be left blank"
      this.presentToast();
    }
    else if (!this.email) {
      this.msg = "Email cannot be left blank"
      this.presentToast();
    }
    else if (!this.adress) {
      this.msg = "bio cannot be left blank"
      this.presentToast();
    }
    else if (!this.password) {
      this.msg = "Password cannot be left blank"
      this.presentToast();
    }
    else if (this.password.length < 8) {
      this.msg = "Password cannot be less than 8"
      this.presentToast();
    }
    else if (this.email[this.email.length - 1] != "m"
      && this.email[this.email.length - 2] != "o"
      && this.email[this.email.length - 3] != "c"
      && this.email[this.email.length - 4] != ".") {

      this.msg = "Invalid email format"
      this.presentToast();
    }
    else {
      this.loaderID = 'signup'
      this.loadermsg = 'Registering as new user..'
      this.presentLoading();
      this.firebaseauth.auth.createUserWithEmailAndPassword(this.email, this.password).then(user => {

        const authSub = this.firebaseauth.authState.subscribe(current_user => {
          this.oneSignal.getIds().then(identity => {
            console.log('plaerid', identity.userId);

            this.deviceID = identity.userId;
            const ProfileImage = 'http://134.122.2.23/uploads/man.png'
            const Name = this.name.toLocaleUpperCase();
            const Email = this.email;
            const Phone = this.phone;
            const Password = this.password;
            const timeJoined = Date.now();
            const Adress = this.adress;
            const type = "USER"
            const userID = current_user.uid;
            const deviceID = this.deviceID
            this.firestore.collection('users').doc(current_user.uid).set({
              Name,
              Email,
              Phone,
              Password,
              deviceID,
              timeJoined,
              Adress,
              type,
              ProfileImage,
              userID,
            }).then(() => {
              user.user.sendEmailVerification().then(() => {
                this.msg = "You have registered successfully please confirm account"
                this.presentToast();
                this.firebaseauth.auth.signOut();
              }).then(() => {

              })

            })
          })

        

        })

      })
      setTimeout(() => {
        this.loadingController.getTop().then(v => {
          if (v != null) {
            this.loadingController.dismiss('signup')
            this.currentPage = false;
          }
        })
      }, 2000);
    }
  }

  validateLogin() {

    if (!this.userEmail) {
      this.msg = "Email cannot be empty"
      this.presentToast();
    }
    else if (!this.userPassword) {
      this.msg = "Password cannot be Empty"
      this.presentToast();
    }
    else if (this.userEmail[this.userEmail.length - 1] != "m"
      && this.userEmail[this.userEmail.length - 2] != "o"
      && this.userEmail[this.userEmail.length - 3] != "c"
      && this.userEmail[this.userEmail.length - 4] != ".") {
      this.msg = "Invalid email format"
      this.presentToast();
    }
    else {
      this.loaderID = 'goHome'
      this.loadermsg = 'Logging in...'
      this.presentLoading();
      this.userEmail = this.userEmail.toLocaleLowerCase();

      console.log("email=>", this.userEmail);
      this.firebaseauth.auth.signInWithEmailAndPassword(this.userEmail, this.userPassword).then(cuser => {
        console.log("user is loggged in", this.firebaseauth.auth.currentUser.uid);
        if (this.firebaseauth.auth.currentUser.emailVerified) {
          this.RouteHome();
        }
        else {
          this.loadingController.getTop().then(i => {
            if (i != null) {
              this.loadingController.dismiss('goHome')
            }
          })
          console.log("please verify your account");
          this.showAlert();

        }
      }).catch((err) => {
        this.msg = "Un-Registered email or Invalid password"
        this.presentToast();
        this.loadingController.getTop().then(i => {
          if (i != null) {
            this.loadingController.dismiss('goHome')
          }
        })
      })
    }

  }

  forgotpassword() {
    if (!this.userEmail) {
      this.msg = 'Did you forgot to add email?'
      this.presentToast();
    }
    else if (this.userEmail[this.userEmail.length - 1] != "m"
      && this.userEmail[this.userEmail.length - 2] != "o"
      && this.userEmail[this.userEmail.length - 3] != "c"
      && this.userEmail[this.userEmail.length - 4] != ".") {
      this.msg = 'Badly formatted Email'
      this.presentToast();
    }
    else {
      this.userEmail = this.userEmail.toLocaleLowerCase();
      this.firebaseauth.auth.sendPasswordResetEmail(this.userEmail).then(() => {
        this.msg = 'An email to reset password is sent'
        this.presentToast();
      }).catch(() => {
        this.msg = 'Unable to send email check back later Before reseting password make sure the email is registered'
        this.presentToast();
      })
    }
  }

  ionViewWillLeave() {
    this.password = ''
    this.phone = null
    this.adress = ''
    this.password = ''
    this.userEmail = ''
    this.userPassword = ''
  }

  ionViewWillEnter() {
    this.password = ''
    this.phone = null
    this.adress = ''
    this.password = ''
    this.userEmail = ''
    this.userPassword = ''
  }
  ngOnInit() {
  }

}
