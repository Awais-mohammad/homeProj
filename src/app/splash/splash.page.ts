import { Component } from '@angular/core';
import { AngularFireAuth } from "angularfire2/auth";
import { Router } from "@angular/router";

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage {

  constructor(
    private auth: AngularFireAuth,
    public route: Router,

  ) {

    setTimeout(() => {
      this.checkLogin()
    }, 3000);

  }

  userID: string;
  checkLogin() {
    this.auth.authState.subscribe(res => {
      if (res && res.uid) {
        console.log("userID=>", res.uid);
        this.userID = res.uid
        console.log("userID=>", this.auth.auth.currentUser.uid);

        if (!res.emailVerified) {
        
          setTimeout(() => {
            this.route.navigate(['authentication'])
            this.auth.auth.signOut();
          }, 2000);
        }
        else {

          setTimeout(() => {
            this.route.navigate(["home/landing"])

            console.log("user login");
          }, 2000);
        }
      }
      else {
     setTimeout(() => {
      this.auth.auth.signOut();
      this.route.navigate(["authentication"])
      console.log("user not loged in");
     }, 2000);

      }
    })

  }


}
