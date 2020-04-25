import { Component, OnInit } from '@angular/core';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { SmartsheetService, ITask } from '../smartsheet.service';

@Component({
  selector: 'app-select-task',
  templateUrl: './select-task.component.html',
  styleUrls: ['./select-task.component.css']
})
export class SelectTaskComponent implements OnInit {

  tasks : ITask[];

  constructor(public dialogRef: MatDialogRef<SelectTaskComponent>, private sm : SmartsheetService) { }

  ngOnInit(): void {
    /**this.afterOpened().subscribe(function(){
      this.sm.getTaskList().subscribe(val => this.tasks = val);
    });**/
  } 

}
