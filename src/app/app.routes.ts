import { Routes } from '@angular/router';
import { PropertyListComponent } from './property-list/property-list.component';
import { PropertyFormComponent } from './property-form/property-form.component';

export const routes: Routes = [
  { path: '', component: PropertyListComponent, title: 'મિલકત યાદી' },
  { path: 'new', component: PropertyFormComponent, title: 'નવી મિલકત' },
  { path: 'edit/:id', component: PropertyFormComponent, title: 'મિલકત સુધારો' },
  { path: '**', redirectTo: '' },
];
