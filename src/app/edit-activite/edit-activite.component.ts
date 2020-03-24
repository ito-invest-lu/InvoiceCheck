import { Component, OnInit, Inject } from '@angular/core';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { InvoiceService, IInvoice, IActivite } from '../invoice.service';

import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-edit-activite',
  templateUrl: './edit-activite.component.html',
  styleUrls: ['./edit-activite.component.css']
})
export class EditActiviteComponent implements OnInit {

  filterForm: FormGroup;

  activite : IActivite;

  activites : IActivite[];

  filteredActivites: IActivite[];

  invoice : IInvoice;

  constructor(public dialogRef: MatDialogRef<EditActiviteComponent>, private is : InvoiceService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      "Activite": new FormControl()
    })
    
    this.is.invoice.subscribe(val => {
      this.invoice = val;
    });
    
    this.is.getActivites().subscribe(val => this.activites = val);
    
    this.filterForm.get('Activite').valueChanges.pipe(debounceTime(600)).pipe(distinctUntilChanged()).subscribe(val => {
      this.filteredActivites = this.activites.filter(c => c.Activite && c.Activite.toLowerCase().includes(val.toLowerCase()));
      this.activite = this.activites.filter(c => c.ActiviteCode && c.ActiviteCode == val)[0];
    });
  }
  
  onNoClick(): void {
    this.dialogRef.close();
  }

  changeActivite(): void {
    console.log('Change Activite to ' + this.activite.ActiviteCode);
    this.is.changeActivite(this.activite.ActiviteCode);
    this.dialogRef.close();
  }

}
