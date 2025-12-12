import { Routes } from '@angular/router';

import { ChannelComponent } from './channel/channel.component';
import { ChannelViewComponent } from './channelView/channelView.component';


export const ChannelRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'channel',
        component: ChannelComponent,

      },
      {
        path: 'view',
        component: ChannelViewComponent,

      },
    ],
  }
];
