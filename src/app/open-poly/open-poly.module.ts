import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OpenPolyPageRoutingModule } from './open-poly-routing.module';

import { OpenPolyPage } from './open-poly.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OpenPolyPageRoutingModule
  ],

})
export class OpenPolyPageModule {}
