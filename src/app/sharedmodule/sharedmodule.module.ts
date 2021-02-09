import { DisplayShopPage } from './../display-shop/display-shop.page';
import { ImageViewerPage } from './../image-viewer/image-viewer.page';
import { OpenPolyPage } from './../open-poly/open-poly.page';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { UserProfilePage } from './../user-profile/user-profile.page';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentsPage } from '../comments/comments.page';



@NgModule({
  declarations: [UserProfilePage, OpenPolyPage, ImageViewerPage,DisplayShopPage,CommentsPage],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
  exports: [UserProfilePage, OpenPolyPage, ImageViewerPage,DisplayShopPage,CommentsPage]
})
export class SharedmoduleModule { }
