import { Routes } from '@angular/router';

import { AppErrorComponent } from './error/error.component';
import { AppMaintenanceComponent } from './maintenance/maintenance.component';
import { AppForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AppLoginComponent } from './login/login.component';
import { AppRegisterComponent } from './register/register.component';
import { AppLockscreenComponent } from './lockscreen/lockscreen.component';

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [      
      {
        path: 'error',
        component: AppErrorComponent,
      },
      {
        path: 'maintenance',
        component: AppMaintenanceComponent,
      },
      {
        path: 'forgot',
        component: AppForgotPasswordComponent,
      },
      {
        path: 'login',
        component: AppLoginComponent,
      },
      {
        path: 'register',
        component: AppRegisterComponent,
      },
      {
        path: 'lockscreen',
        component: AppLockscreenComponent,
      },
    ],
  },
];
