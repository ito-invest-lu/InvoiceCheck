import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowseInvoiceComponent } from './browse-invoice/browse-invoice.component';

const routes: Routes = [
  { path: 'browse', component: BrowseInvoiceComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
