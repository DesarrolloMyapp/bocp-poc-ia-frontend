import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { ProductOneComponent } from './productOne/productOne/productOne.component';
import { JobStatusComponent } from './job-status/job-status.component';

export const PagesRoutes: Routes = [
  {
    path: '',
    component: StarterComponent,
    data: {
      title: 'Starter Page',
    },
  },
  {
    path: 'jobs',
    component: JobStatusComponent,
    data: {
      title: 'Estado de Jobs',
    },
  },

];
