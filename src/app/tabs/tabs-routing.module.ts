import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'readings',
        loadChildren: () => import('../readings/readings.module').then(m => m.ReadingsPageModule)
      },
      {
        path: 'books',
        loadChildren: () => import('../books/books.module').then(m => m.BooksPageModule)
      },
       {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: '',
        redirectTo: 'readings',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/readings',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
