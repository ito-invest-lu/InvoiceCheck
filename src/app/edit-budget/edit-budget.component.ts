import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { InvoiceService, IInvoice, IChantier, IBudgetLine } from '../invoice.service';

import { EditBudgetLineComponent } from '../edit-budget-line/edit-budget-line.component';

import { SplitBudgetLineComponent } from '../split-budget-line/split-budget-line.component';

import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-edit-budget',
  templateUrl: './edit-budget.component.html',
  styleUrls: ['./edit-budget.component.css']
})
export class EditBudgetComponent implements OnInit {

  filterForm: FormGroup;

  chantier : IChantier;
  lines : IBudgetLine[];

  chantiers : IChantier[];

  filteredChantiers: IChantier[];
  
  displayedColumns: string[] = ['id', 'activite', 'date', 'origin', 'quantite', 'montant', 'actions'];
  
  montant : number;
  
  quantite : number;

  constructor(private is : InvoiceService, private fb: FormBuilder, private route: ActivatedRoute, private router: Router, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      "Chantier": new FormControl()
    })
    
    this.is.getChantiers().subscribe(val => this.chantiers = val);
    
    this.filterForm.get('Chantier').valueChanges.pipe(debounceTime(600)).pipe(distinctUntilChanged()).subscribe(val => {
      this.filteredChantiers = this.chantiers.filter(c => c.Chantier && c.Chantier.toLowerCase().includes(val.toLowerCase()));
    });
    
    this.route.paramMap.subscribe(val => {
      if(val.get('chantier')) {
        this.filterForm.setValue({Chantier : val.get('chantier')});
        this.is.getBudgetFromServer(val.get('chantier'));
      }
    });
    
    this.is.chantier.subscribe(
      val => this.chantier = val
    );
    this.is.budget_lines.subscribe(
      val => {
        this.lines = val;
        if(this.lines && this.lines.length > 0) {
          this.montant = this.lines.map(l => l.Montant).reduce((sum, current) => sum + current);
          this.quantite = this.lines.map(l => l.Quantite).reduce((sum, current) => sum + current);
        }
      }
    );
  }
  
  displayChantier() {
    if(this.filterForm.get('Chantier').value) {
      this.router.navigate(['/edit', this.filterForm.get('Chantier').value]);
      this.is.getBudgetFromServer(this.filterForm.get('Chantier').value);
    }
  }
  
  addBudgetLine() {
    this.is.newBudgetLine();
    this.dialog.open(EditBudgetLineComponent);
  }
  
  editBudgetLine(line : IBudgetLine) {
    this.is.loadBudgetLine(line);
    this.dialog.open(EditBudgetLineComponent);
  }
  
  copyBudgetLine(line : IBudgetLine) {
    this.is.copyBudgetLine(line);
    this.dialog.open(EditBudgetLineComponent);
  }
  
  splitBudgetLine(line : IBudgetLine) {
    this.is.copyBudgetLine(line);
    this.dialog.open(SplitBudgetLineComponent);
  }
  
  deleteBudgetLine(line : IBudgetLine) {
    this.is.deleteBudgetLine(line);
  }

}
