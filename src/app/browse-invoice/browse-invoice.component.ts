import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { InvoiceService, IInvoiceQuery, IInvoice } from '../invoice.service';
import { EditChantierComponent } from '../edit-chantier/edit-chantier.component';
import { EditActiviteComponent } from '../edit-activite/edit-activite.component';

@Component({
  selector: 'app-browse-invoice',
  templateUrl: './browse-invoice.component.html',
  styleUrls: ['./browse-invoice.component.css']
})
export class BrowseInvoiceComponent implements OnInit {

  filterForm: FormGroup;

  journals: Observable<string[]>;

  filteredNumbers: Observable<string[]>;
  
  invoice: IInvoice;
  
  pdf : string;

  constructor(
        private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder, 
        private is: InvoiceService,
        public dialog: MatDialog) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      "Company": new FormControl('001'),
      "Journal": new FormControl('E01'),
      "Number": new FormControl(''),
    });
    
    this.journals = of(['E01','EBG','ABR','ABG']);
    
    this.filterForm.get('Company').valueChanges.subscribe(val=>{
      if(val == '001') {
        this.journals = of(['E01','EBG','ABR','ABG']);
      }
      if(val == '100') {
        this.journals = of(['E01','E02','A01','A02']);
      }
      if(val == '200') {
        this.journals = of(['E01','E02','A01','A02']);
      }
    });
    
    this.filterForm.get('Number').valueChanges.pipe(debounceTime(600)).pipe(distinctUntilChanged()).subscribe(val => {
      this.filteredNumbers = this.is.getNumberList(this.filterForm.getRawValue());
    });
      
    this.is.invoice.subscribe(val => {
      this.invoice = val;
    });
    
    this.is.invoicePDF.subscribe(val => {
      if(val) {
        this.pdf = 'https://scanin.socomaconstruction.com/' + val.PDF;
      }
    });
    
    this.route.paramMap.subscribe(val => {
      if(val.get('number')) {
        this.filterForm.setValue({Company : val.get('company'),Journal : val.get('journal'),Number : val.get('number')});
        this.is.getInvoiceFromServer(this.filterForm.getRawValue());
      }
    });
  }
  
  displayInvoice() {
    if(this.filterForm.get('Number').value) {
      this.router.navigate(['/invoice', this.filterForm.get('Company').value, this.filterForm.get('Journal').value, this.filterForm.get('Number').value])
    }
  }

  displayNextInvoice() {
    if(this.filterForm.get('Number').value) {
      this.router.navigate(['/invoice', this.filterForm.get('Company').value, this.filterForm.get('Journal').value, Number(this.filterForm.get('Number').value) + 1])
    }
  } 

  editChantier() {
    this.dialog.open(EditChantierComponent);
  }

  editActivite() {
    this.dialog.open(EditActiviteComponent);
  }

}
