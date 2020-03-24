import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowseInvoiceComponent } from './browse-invoice/browse-invoice.component';
import { EditBudgetComponent } from './edit-budget/edit-budget.component';

const routes: Routes = [
  { path: 'browse', component: BrowseInvoiceComponent },
  { path: 'invoice/:company/:journal/:number', component: BrowseInvoiceComponent },
  { path: 'edit', component: EditBudgetComponent },
  { path: 'edit/:chantier', component: EditBudgetComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
