import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { InvoiceService, IBudgetLine, IChantier, IActivite } from '../invoice.service';

import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { Moment } from 'moment';
import * as moment from 'moment';

@Component({
  selector: 'app-edit-budget-line',
  templateUrl: './edit-budget-line.component.html',
  styleUrls: ['./edit-budget-line.component.css']
})
export class EditBudgetLineComponent implements OnInit {

  @ViewChild("origine") origineInput : ElementRef;

  filterForm: FormGroup;

  activites : IActivite[];

  filteredActivites: IActivite[];

  line : IBudgetLine;

  constructor(public dialogRef: MatDialogRef<EditBudgetLineComponent>, private is : InvoiceService, private fb: FormBuilder) { }

  ngOnInit(): void {
    
    this.filterForm = this.fb.group({
      "Id": new FormControl(),
      "ClientCode": new FormControl(),
      "Client": new FormControl(),
      "ActiviteCode": new FormControl(),
      "Activite": new FormControl(),
      "Date": new FormControl(moment()),
      "Origine": new FormControl(),
      "Quantite": new FormControl(),
      "Montant": new FormControl()
    })

    this.is.budget_line.subscribe(val => {
      this.line = val;
      this.filterForm.patchValue(this.line);
    });
    
    this.is.getActivites().subscribe(val => this.activites = val);
    
    this.filterForm.get('ActiviteCode').valueChanges.pipe(debounceTime(600)).pipe(distinctUntilChanged()).subscribe(val => {
      this.filteredActivites = this.activites.filter(c => c.ActiviteCode && c.ActiviteCode.includes(val.toLowerCase()));
      let activite = this.activites.filter(c => c.ActiviteCode && c.ActiviteCode == val)[0];
      if(activite) {
        this.filterForm.patchValue({ 'Activite' : activite.Activite });
        this.origineInput.nativeElement.focus();
      }
    });
    
    this.filterForm.get('Activite').valueChanges.pipe(debounceTime(600)).pipe(distinctUntilChanged()).subscribe(val => {
      this.filteredActivites = this.activites.filter(c => c.Activite && c.Activite.toLowerCase().includes(val.toLowerCase()));
      let activite = this.activites.filter(c => c.Activite && c.Activite == val)[0];
      if(activite) {
        this.filterForm.patchValue({ 'ActiviteCode' : activite.ActiviteCode });
        this.origineInput.nativeElement.focus();
      }
    });
    
    this.filterForm.valueChanges.subscribe(val => {
      Object.assign(this.line, this.filterForm.getRawValue());
    });
  }
  
  onNoClick(): void {
    this.dialogRef.close();
  }
  
  onOkClick(): void {
    this.is.saveBudgetLine(this.line);
    this.dialogRef.close();
  }
  
  onNewClick(): void {
    this.is.saveBudgetLine(this.line);
    this.is.copyBudgetLine(this.line);
    this.filteredActivites = this.activites;
    this.filterForm.patchValue({
      "Quantite": 0,
      "Montant": 0
    });
  }

}
