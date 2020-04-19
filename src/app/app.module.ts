import { BrowserModule } from '@angular/platform-browser';
import { NgModule, DEFAULT_CURRENCY_CODE, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppNavComponent } from './app-nav/app-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AppRoutingModule } from './app-routing.module';
import { BrowseInvoiceComponent } from './browse-invoice/browse-invoice.component';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule, MAT_AUTOCOMPLETE_DEFAULT_OPTIONS } from '@angular/material/autocomplete';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

import { FlexLayoutModule } from '@angular/flex-layout';

import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { EditChantierComponent } from './edit-chantier/edit-chantier.component';
import { EditActiviteComponent } from './edit-activite/edit-activite.component';
import { EditBudgetComponent } from './edit-budget/edit-budget.component';
import { EditBudgetLineComponent } from './edit-budget-line/edit-budget-line.component';
import { SplitBudgetLineComponent } from './split-budget-line/split-budget-line.component';
import { PlanComponent } from './plan/plan.component';

registerLocaleData(localeFr, 'fr');

@NgModule({
  declarations: [
    AppComponent,
    AppNavComponent,
    BrowseInvoiceComponent,
    EditChantierComponent,
    EditActiviteComponent,
    EditBudgetComponent,
    EditBudgetLineComponent,
    SplitBudgetLineComponent,
    PlanComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatTableModule,
    MatDatepickerModule,
    MatMomentDateModule,
    FormsModule,
    ReactiveFormsModule,
    NgxExtendedPdfViewerModule,
    FlexLayoutModule,
    AppRoutingModule
  ],
  providers: [
    {provide: LOCALE_ID, useValue: 'fr-BE' },
    {provide: MAT_DATE_LOCALE, useValue: 'fr-BE'},
    {provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR'},
    {provide: MAT_AUTOCOMPLETE_DEFAULT_OPTIONS, useValue: {autoActiveFirstOption: true}},
  ],
  bootstrap: [AppComponent]
})

export class AppModule { 
}
