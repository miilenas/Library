import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AdminGuard } from '../guards/admin.guard';
import { AuthGuard } from '../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'readings',
        loadChildren: () => import('../readings/readings.module').then(m => m.ReadingsPageModule),
        canActivate: [AuthGuard]
      },
      {
        path: 'books',
        loadChildren: () => import('../books/books.module').then(m => m.BooksPageModule),
        canActivate: [AuthGuard]
      },
       {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule),
        canActivate: [AuthGuard]
      },
        {
    path: 'admin',
    loadChildren: () => import('../admin/admin.module').then(m => m.AdminPageModule),
    canActivate: [AdminGuard]
  },
      // {
      //   path: '',
      //   redirectTo: 'readings',
      //   pathMatch: 'full'
      // }
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
