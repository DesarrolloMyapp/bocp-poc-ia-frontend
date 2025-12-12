import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ProductProcessingViewRoutes } from './productProcessingView.routing';

@NgModule({
  imports: [
    RouterModule.forChild(ProductProcessingViewRoutes),

  ],
})
export class ProductProcessingViewModule {}
