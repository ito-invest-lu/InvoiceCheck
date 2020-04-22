import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { InvoiceService, IInvoiceQuery, IDevis } from '../invoice.service';

@Component({
  selector: 'app-browse-devis',
  templateUrl: './browse-devis.component.html',
  styleUrls: ['./browse-devis.component.css']
})
export class BrowseDevisComponent implements OnInit {

  filterForm: FormGroup;

  filteredNumbers: Observable<string[]>;
  
  devis: IDevis;
  
  pdf : string;


  constructor(private route: ActivatedRoute,
        private router: Router,
        private fb: FormBuilder, 
        private is: InvoiceService) { }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      "Company": new FormControl('001'),
      "Number": new FormControl(''),
    });
    
    this.filterForm.get('Number').valueChanges.pipe(debounceTime(600)).pipe(distinctUntilChanged()).subscribe(val => {
      this.filteredNumbers = this.is.getDevisList(this.filterForm.get('Company').value,this.filterForm.get('Number').value);
    });
    
    this.route.paramMap.subscribe(val => {
      if(val.get('number')) {
        this.filterForm.setValue({Company : val.get('company'),Number : val.get('number')});
        this.is.getDevisFromServer(this.filterForm.get('Company').value,this.filterForm.get('Number').value);
      } else {
        this.devis = undefined;
        this.pdf = undefined;
      }
    });
    
    this.is.devis.subscribe(val => {
      if(val) {
        this.devis = val;
        this.pdf = 'https://scanin.socomaconstruction.com/' + this.devis.PDF;
      }
    });
  }
  
  displayDevis() {
    if(this.filterForm.get('Number').value) {
      this.router.navigate(['/devis', this.filterForm.get('Company').value, this.filterForm.get('Number').value])
    }
  }

}
