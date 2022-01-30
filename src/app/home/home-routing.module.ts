import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';


const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [

      {
        path: 'landing',
        children: [
          {
            path: '',
            loadChildren: () => import('../home/landing/landing.module').then(m => m.LandingPageModule)
          }
        ]
      },

      {
        path: 'menu',
        children: [
          {
            path: '',
            loadChildren: () => import('../home/menu/menu.module').then(m => m.MenuPageModule)
          }
        ]
      },


      {
        path: 'notifications',
        children: [
          {
            path: '',
            loadChildren: () => import('../home/notifications/notifications.module').then(m => m.NotificationsPageModule)
          }
        ]
      },
  


      {
        path: 'gallery',
        children: [
          {
            path: '',
            loadChildren: () => import('../home/gallery/gallery.module').then(m => m.GalleryPageModule)
          }
        ]
      },
      {
        path: 'feed',
        children: [
          {
            path: '',
            loadChildren: () => import('../home/feed/feed.module').then(m => m.FeedPageModule)
          }
        ]
      },

      {
        path: 'settings',
        children: [
          {
            path: '',
            loadChildren: () => import('../home/settings/settings.module').then( m => m.SettingsPageModule)
          }
        ]
        
      },
    ]
  },
  {
    path: '',
    redirectTo: 'app/home/landing',
    pathMatch: 'full'
  },



]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule { }
