import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DisplayShopPageRoutingModule } from './display-shop-routing.module';

import { DisplayShopPage } from './display-shop.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DisplayShopPageRoutingModule
  ],

})
export class DisplayShopPageModule {}
