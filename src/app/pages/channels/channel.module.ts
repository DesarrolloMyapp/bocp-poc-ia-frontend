  import { NgModule } from '@angular/core';
  import { RouterModule } from '@angular/router';

  import { ChannelRoutes } from './channel.routing';


  @NgModule({
    imports: [
      RouterModule.forChild(ChannelRoutes),
    ],
  })
  export class ChannelModule {}
