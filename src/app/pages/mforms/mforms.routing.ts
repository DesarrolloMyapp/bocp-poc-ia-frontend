import { Routes } from '@angular/router';

// components
import { MformsComponent } from './mforms.component';

export const MFormsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'index',
        component: MformsComponent,
      },
    ],
  },
];
