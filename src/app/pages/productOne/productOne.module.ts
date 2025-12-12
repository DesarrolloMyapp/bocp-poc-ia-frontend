import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ProductOneRoutes } from './productOne.routing';

@NgModule({
  imports: [
    RouterModule.forChild(ProductOneRoutes),

  ],
})
export class ProductOneModule {}
