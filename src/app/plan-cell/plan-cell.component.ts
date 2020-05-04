import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from "rxjs/Observable";
import { filter, map } from 'rxjs/operators';

import { SmartsheetService, IEmployee, IAssignation, ITask } from '../smartsheet.service';

import { SelectTaskComponent } from '../select-task/select-task.component';

import { Moment } from 'moment';
import * as moment from 'moment';

@Component({
  selector: 'app-plan-cell',
  templateUrl: './plan-cell.component.html',
  styleUrls: ['./plan-cell.component.css']
})
export class PlanCellComponent implements OnInit {

  @Input() public employee : IEmployee;
  @Input() public index : number;
  
  private cellId : string;
  
  public date : Moment;
  
  public assignation : IAssignation
  
  constructor(private sm : SmartsheetService, public dialog: MatDialog, private cdr: ChangeDetectorRef) {  }

  ngOnInit() {
    this.sm.dates.pipe(map(t => t[this.index])).subscribe(val =>{
      this.date = val;
      this.cellId = val.format("YYYY-MM-DD-")+this.employee.EmployeeCode;
    });
    this.sm.assignations.pipe(filter(assignation => assignation && assignation.Employee == this.employee && assignation.Date == this.date.format('YYYY-MM-DD'))).subscribe(val => this.assignation = val);
    this.sm.dates.pipe(map(t => t[this.index])).subscribe(val => this.date = val);
    this.sm.assignations.pipe(
        filter(assignation => assignation && assignation._id === this.cellId))
        .subscribe(val => {
          this.assignation = val;
          this.cdr.detectChanges();
        });
    this.sm.resetPlanning.subscribe(
      val => this.assignation = undefined
    );
  }

  AssignTask() {
    let dialogRef = this.dialog.open(SelectTaskComponent, { data: { task_id : this.assignation?.Task.TaskId }, });
    
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        if(this.assignation) {
          this.assignation.Task = result;
          this.sm.updateAssignation(this.assignation);
        } else {
          this.sm.addAssignation(
            this.employee, 
            this.date, 
            result
          );
        }
      }
    });
  }

}
