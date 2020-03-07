import { Component, OnInit, Inject } from '@angular/core';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { InvoiceService, IInvoice, IChantier } from '../invoice.service';

import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-edit-chantier',
  templateUrl: './edit-chantier.component.html',
  styleUrls: ['./edit-chantier.component.css']
})
export class EditChantierComponent implements OnInit {

  filterForm: FormGroup;

  chantiers : Observable<IChantier[]>;

  filteredChantiers: Observable<IChantier[]>;

  invoice : IInvoice;

  constructor(public dialogRef: MatDialogRef<EditChantierComponent>, private is : InvoiceService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      "Chantier": new FormControl()
    })
    this.invoice = this.is.invoice;
    this.chantiers = this.is.getChantiers();
    this.filterForm.get('Chantier').valueChanges.debounceTime(600).distinctUntilChanged().subscribe(val => {
      this.filteredChantiers = this.chantiers.map(chantiers => chantiers.filter(c => c.Chantier && c.Chantier.toLowerCase().includes(val.toLowerCase())));
    });
  }
  
  onNoClick(): void {
    this.dialogRef.close();
  }

  changeChantier(): void {
    console.log('Change Chantier to ' + this.filterForm.get('Chantier').value);
    this.dialogRef.close();
  }

}
