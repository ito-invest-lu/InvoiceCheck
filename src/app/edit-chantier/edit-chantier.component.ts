import { Component, OnInit } from '@angular/core';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { InvoiceService, IInvoice, IChantier } from '../invoice.service';

import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-edit-chantier',
  templateUrl: './edit-chantier.component.html',
  styleUrls: ['./edit-chantier.component.css']
})
export class EditChantierComponent implements OnInit {

  filterForm: FormGroup;

  chantier : IChantier;

  chantiers : IChantier[];

  filteredChantiers: IChantier[];

  invoice : IInvoice;

  constructor(public dialogRef: MatDialogRef<EditChantierComponent>, private is : InvoiceService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      "Chantier": new FormControl()
    })
    this.is.invoice.subscribe(val => {
      this.invoice = val;
    });
    
    this.is.getChantiers().subscribe(val => this.chantiers = val);
    
    this.filterForm.get('Chantier').valueChanges.pipe(debounceTime(600)).pipe(distinctUntilChanged()).subscribe(val => {
      this.filteredChantiers = this.chantiers.filter(c => c.Chantier && c.Chantier.toLowerCase().includes(val.toLowerCase()));
      this.chantier = this.chantiers.filter(c => c.ChantierCode && c.ChantierCode == val)[0];
    });
  }
  
  onNoClick(): void {
    this.dialogRef.close();
  }

  changeChantier(): void {
    console.log('Change Chantier to ' + this.chantier.ChantierCode);
    this.is.changeChantier(this.chantier.ChantierCode);
    this.dialogRef.close();
  }

}
