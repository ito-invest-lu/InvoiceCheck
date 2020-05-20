import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';

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

  constructor(
        private route: ActivatedRoute,
        private router: Router,
        public sm : SmartsheetService) { }

  ngOnInit(): void {
    this.sm.getTeams().subscribe(val => this.teams = val);

    this.sm.resetDates();
    interval(9000000).subscribe(t => this.sm.resetDates());
    
    this.sm.refreshPlanning();
    
    this.sm.dates.subscribe(val => {
      this.dates = val;
      this.router.navigate(['/plan', val[0].format("YYYY-MM-DD")]);
    });
    
    this.route.paramMap.subscribe(val => {
      if(val.get('start')) {
        this.sm.setStart(val.get('start'));
      }
    });
  }
  
  addTask() {
    window.open("https://app.smartsheet.com/b/form/b59b14a1fadd41c89518a604c6cd3c04", "_blank");
  }
  
  copyNext(index : number) {
    this.sm.copyDay(this.dates[index], this.dates[index+1]);
  } 
}
