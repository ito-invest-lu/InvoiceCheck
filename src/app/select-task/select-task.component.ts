import { Component, OnInit } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';

import { SmartsheetService, ITask } from '../smartsheet.service';

@Component({
  selector: 'app-select-task',
  templateUrl: './select-task.component.html',
  styleUrls: ['./select-task.component.css']
})
export class SelectTaskComponent implements OnInit {

  tasks : ITask[];

  selectedTask : string;

  constructor(public dialogRef: MatDialogRef<SelectTaskComponent>, private sm : SmartsheetService) { }

  ngOnInit(): void {
    this.sm.tasks.subscribe(val => this.tasks = val);
  }
  
  onNoClick(): void {
    this.dialogRef.close();
  }
  
  onOkClick(): void {
    this.dialogRef.close(this.tasks.filter(t => t.TaskId == this.selectedTask)[0]);
  }

}
