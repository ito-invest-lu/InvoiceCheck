import { Component, OnInit } from '@angular/core';

import { SmartsheetService } from '../smartsheet.service';

@Component({
  selector: 'app-db-log',
  templateUrl: './db-log.component.html',
  styleUrls: ['./db-log.component.css']
})
export class DbLogComponent implements OnInit {

  public logs : string[] = [];

  constructor(private sm : SmartsheetService) {  }

  ngOnInit(): void {
    this.sm.log.subscribe(entry => {
      this.logs = [entry.direction + " - " + entry.change.docs[0]._id, ...this.logs.slice(0, 5)];
    })
  }

}
