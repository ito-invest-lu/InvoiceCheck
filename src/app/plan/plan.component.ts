import { Component, OnInit } from '@angular/core';

import { interval, of } from 'rxjs';
import { Observable } from "rxjs/Observable";
import { map } from 'rxjs/operators';

import { SmartsheetService, IEmployee, ITeam } from '../smartsheet.service';

import { Moment } from 'moment';
import * as moment from 'moment';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.css']
})
export class PlanComponent implements OnInit {

  teams : ITeam[];
  
  dates : Moment[];

  constructor(public sm : SmartsheetService) { }

  ngOnInit(): void {
    this.sm.getTeams().subscribe(val => this.teams = val);

    this.sm.resetDates();
    interval(9000000).subscribe(t => this.sm.resetDates());
    
    this.sm.refreshPlanning();
    
    this.sm.dates.subscribe(val => this.dates = val);
  }
  
  copyNext(index : number) {
    this.sm.copyDay(this.dates[index], this.dates[index+1]);
  } 
}
