import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'authentication',
    loadChildren: () => import('./authentication/authentication.module').then(m => m.AuthenticationPageModule)
  },
  {
    path: 'user-profile',
    loadChildren: () => import('./user-profile/user-profile.module').then( m => m.UserProfilePageModule)
  },
  {
    path: 'open-poly',
    loadChildren: () => import('./open-poly/open-poly.module').then( m => m.OpenPolyPageModule)
  },
  {
    path: 'image-viewer',
    loadChildren: () => import('./image-viewer/image-viewer.module').then( m => m.ImageViewerPageModule)
  },
  {
    path: 'display-shop',
    loadChildren: () => import('./display-shop/display-shop.module').then( m => m.DisplayShopPageModule)
  },
 

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
