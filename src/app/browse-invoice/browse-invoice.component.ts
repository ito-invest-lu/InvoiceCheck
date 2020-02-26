import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { InvoiceService, IInvoiceQuery, IInvoice } from '../invoice.service';

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

  constructor(private fb: FormBuilder, private is: InvoiceService) {}

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
    
    this.filterForm.get('Number').valueChanges.debounceTime(600).distinctUntilChanged().subscribe(val => {
      this.filteredNumbers = this.is.getNumberList(this.filterForm.getRawValue());
    });
  }
  
  displayInvoice() {
    this.is.getInvoiceList(this.filterForm.getRawValue()).subscribe(val => {
      this.invoice = val[0];
    });
    this.is.getInvoicePDFList(this.filterForm.getRawValue()).subscribe(val => {
      this.pdf = 'https://scanin.socomaconstruction.com/'+val[0].PDF;
    });
  }

}
