import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from './compononents/chat/chat.component';

const APP_ROUTES: Routes = [
    { path: 'chat', component: ChatComponent },
    { path: '', redirectTo: '/chat', pathMatch: 'full' }
  ];

export const APP_ROUTING = RouterModule.forRoot(APP_ROUTES);
