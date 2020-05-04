import { Component, OnInit, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SmartsheetService, ITask } from '../smartsheet.service';

@Component({
  selector: 'app-select-task',
  templateUrl: './select-task.component.html',
  styleUrls: ['./select-task.component.css']
})
export class SelectTaskComponent implements OnInit {

  tasks : ITask[];

  selectedTask : string;

  constructor(public dialogRef: MatDialogRef<SelectTaskComponent>, private sm : SmartsheetService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.sm.tasks.subscribe(val => this.tasks = val);
    this.selectedTask = this.data?.task_id;
  }
  
  onNoClick(): void {
    this.dialogRef.close();
  }
  
  onOkClick(): void {
    this.dialogRef.close(this.tasks.filter(t => t.TaskId == this.selectedTask)[0]);
  }

}
