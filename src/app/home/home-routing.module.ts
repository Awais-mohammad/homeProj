import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';


const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
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
        path: 'profile',
        children: [
          {
            path: '',
            loadChildren: () => import('../home/profile/profile.module').then(m => m.ProfilePageModule)
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
      }
    ]
  },
  {
    path: '',
    redirectTo: '/home/feed',
    pathMatch: 'full'
  },
  {
    path: 'feed',
    loadChildren: () => import('./feed/feed.module').then(m => m.FeedPageModule)
  },



]
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule { }
