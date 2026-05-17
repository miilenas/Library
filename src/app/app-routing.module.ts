import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  
 {
    path: '',
    redirectTo: 'first',
    pathMatch: 'full'
  },

  {
  path: 'admin',
  loadChildren: () => import('./admin/admin.module').then(m => m.AdminPageModule),
  canActivate: [AdminGuard]
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule),
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'readings',
    loadChildren:()=>import('./readings/readings.module').then(m => m.ReadingsPageModule),
    canActivate: [AuthGuard]

  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path:'first',
    loadChildren: ()=>import('./firstPage/first.module').then(m=>m.FirstPageModule)
  },
 
  

  


];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
