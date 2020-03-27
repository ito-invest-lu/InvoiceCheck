import { Component, OnInit } from '@angular/core';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { InvoiceService, IBudgetLine, IChantier, IActivite } from '../invoice.service';

import { take, map } from 'rxjs/operators';

@Component({
  selector: 'app-split-budget-line',
  templateUrl: './split-budget-line.component.html',
  styleUrls: ['./split-budget-line.component.css']
})
export class SplitBudgetLineComponent implements OnInit {

  source_line : IBudgetLine;
  
  lines : IBudgetLine[] = [];

  activites : IActivite[];
  
  displayedColumns: string[] = ['activite', 'quantite', 'montant', 'actions'];
  
  quantite : number;
  
  montant : number;

  constructor(public dialogRef: MatDialogRef<SplitBudgetLineComponent>, private is : InvoiceService) { 
  }

  ngOnInit(): void {
    
    this.dialogRef.afterOpened().subscribe(() => {
      this.is.budget_line.pipe(take(1)).subscribe(val => {
        this.source_line = val;
        this.quantite = 0;
        this.montant = 0;
        this.lines = [];
        this.addBudgetLine();
      });
    });
    
    this.is.budget_line.subscribe(val => {
      if(this.lines) {
        this.lines = this.lines.concat(val);
      } else {
        this.lines = [val];
      }
    });
    
    this.is.getActivites().subscribe(val => this.activites = val);
    
  }

  addBudgetLine() {
    this.is.copyBudgetLine(this.source_line);
    this.recomputeTotals();
  }
  
  deleteBudgetLine(line : IBudgetLine) {
    this.lines = this.lines.filter(obj => obj !== line);
    this.recomputeTotals();
  }
  
  onNoClick(): void {
    this.dialogRef.close();
  }
  
  onOkClick(): void {
    for (let line_idx in this.lines) {
      this.is.saveBudgetLine(this.lines[line_idx]);
    }
    this.is.deleteBudgetLine(this.source_line);
    this.dialogRef.close();
  }
  
  onChangeActivite(line : IBudgetLine) {
    line.Activite = this.activites.filter(a => a.ActiviteCode = line.ActiviteCode)[0].Activite;
    console.log(line);
  }

  recomputeTotals() {
    this.montant = Number(this.source_line.Montant) - this.lines.map(l => Number(l.Montant)).reduce((sum, current) => sum + current, 0);
    this.quantite = Number(this.source_line.Quantite) - this.lines.map(l => Number(l.Quantite)).reduce((sum, current) => sum + current, 0);
  }
}
