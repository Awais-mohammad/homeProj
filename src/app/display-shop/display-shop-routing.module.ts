import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DisplayShopPage } from './display-shop.page';

const routes: Routes = [
  {
    path: '',
    component: DisplayShopPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DisplayShopPageRoutingModule {}
