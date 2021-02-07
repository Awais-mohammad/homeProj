import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OpenPolyPage } from './open-poly.page';

const routes: Routes = [
  {
    path: '',
    component: OpenPolyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OpenPolyPageRoutingModule {}
