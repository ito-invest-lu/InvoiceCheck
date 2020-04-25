import { Component, OnInit } from '@angular/core';

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
  
  days : any[];

  constructor(private sm : SmartsheetService) { }

  ngOnInit(): void {
    this.sm.getTeams().subscribe(val => this.teams = val);
    this.days = [moment()];
  }

}
