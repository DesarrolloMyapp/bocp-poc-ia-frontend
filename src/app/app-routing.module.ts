import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { JobStatusComponent } from './pages/job-status/job-status.component';

import { AuthGuard } from './guards/auth/auth.guard';




const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    children: [
      {
        path: '',
        redirectTo: '/dashboards/dashboard1',
        pathMatch: 'full',
      },
      {
        path: 'starter',
        loadChildren: () =>
          import('./pages/pages.module').then((m) => m.PagesModule),
      },
      {
        path: 'dashboards',
        loadChildren: () =>
          import('./pages/dashboards/dashboards.module').then(
            (m) => m.DashboardsModule
          ),
      },
      // {
      //   path: 'mforms',
      //   loadChildren: () =>
      //     import('./pages/mforms/mforms.module').then(
      //       (m) => m.MformsModule
      //     ),
      // },
      {
        path: 'product/:gtin',
        loadChildren: () =>
          import('./pages/productOne/productOne.module').then(
            (m) => m.ProductOneModule
          ),
      },
      {
        path: 'product-catalog',
        loadChildren: () =>
          import('./pages/productProcessingView/productProcessingView.module').then(
            (m) => m.ProductProcessingViewModule
          ),
      },
      {
        path: 'channels',
        loadChildren: () =>
          import('./pages/channels/channel.module').then(
            (m) => m.ChannelModule
          ),
      },
      {
        path: 'jobs',
        component: JobStatusComponent,
        data: {
          title: 'Estado de Jobs',
        },
      },
    ],
    canActivate: [AuthGuard]
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.module').then(
            (m) => m.AuthenticationModule
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/dashboards/dashboard1',
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }

// Instrucciones detalladas para agregar nuevas rutas:
/*
  Importante
  Para que el componente este contenido dentro del diseño del template debe agregarse dentro de la lista children de la primer ruta
  de lo contrario no contendra el diseño del navbar ni el sidebar

  1. Importar el componente que quieres asociar a la nueva ruta:
     import { NewComponent } from './path/to/new-component/new-component.component';

  2. Agregar una nueva entrada en el arreglo `routes`:
     {
       path: 'new-path', // Define la nueva ruta
       component: NewComponent, // Asocia el componente importado a esta ruta
       canActivate: [AuthGuard] // (Opcional) Añade guardias de autenticacion a la ruta si es necesario
     }

  3. Asegúrate de que la ruta del componente sea correcta y que el componente esté declarado en algún módulo.

  4. (Opcional) Si necesitas proteger la nueva ruta con un guard, asegúrate de que el guard esté correctamente implementado e importado:
     import { AuthGuard } from './guards/auth.guard';

  5. Si usas Lazy Loading para módulos, puedes configurar la ruta así:
     {
       path: 'new-path',
       loadChildren: () => import('./path/to/new-module/new-module.module').then(m => m.NewModule)
     }

  6. Después de agregar la nueva ruta, asegúrate de actualizar el menú de navegación o cualquier enlace que haga referencia a esta nueva ruta.
*/

//
/*

*/
