import { DisplayShopPage } from './../../display-shop/display-shop.page';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FeedPageRoutingModule } from './feed-routing.module';

import { FeedPage } from './feed.page';
import { UserProfilePage } from 'src/app/user-profile/user-profile.page';
import { CommentsPage } from 'src/app/comments/comments.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FeedPageRoutingModule
  ],
  declarations: [FeedPage],
  entryComponents: [UserProfilePage, DisplayShopPage,CommentsPage]
})
export class FeedPageModule { }
