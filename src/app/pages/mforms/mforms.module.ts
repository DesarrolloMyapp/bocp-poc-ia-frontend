import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MFormsRoutes } from './mforms.routing';
import { MformsComponent } from './mforms.component';



@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(MFormsRoutes),
    MformsComponent,
  ]
})
export class MformsModule { }
