import { Injectable, OnInit, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { take, map } from 'rxjs/operators';

import { Moment } from 'moment';
import * as moment from 'moment';

import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication';

PouchDB.plugin(PouchAuth)

const db_url = environment.db_server;

const smartsheet_url = "http://api.socomaconstruction.com/2.0";
const smartsheet_token = "3w36gmndb7aax3y3ynhyg515gm";

const httpOptionsCouchdb = {
  headers: new HttpHeaders(
    {
      'Content-Type': 'application/json',
      'Authorization': `Basic ` + btoa('timesheet_user:Socoma2020!'),
    }
  ),
  withCredentials: true,
};

const httpOptions = {
  headers: new HttpHeaders(
    {
      'Content-Type': 'application/json',
      'accept-encoding': 'gzip, deflate',
      'Authorization': `Bearer ` + smartsheet_token,
    }
  ),
  withCredentials: true,
};

interface ICell {
    columnId: number;
    value: string;
    displayValue: string;
}

interface IRow {
    id: number;
    sheetId: number;
    rowNumber: number;
    cells: Array<ICell>;
}

interface SmarsheetReportResponse {
    totalItems: number;
    rows: Array<IRow>;
}

export interface ITask {
  TaskId : string,
  Name : string,
  Chantier : string,
};

export interface IAssignation {
  _id : string;
  _rev : string;
  Task : ITask;
  Employee : IEmployee;
  Date : string;
}

interface TeamResponse {
    _id : string;
    _rev : string;
    teams : Array<ITeam>;
}

export interface ITeam {
    "Name": string,
    "Employees" : IEmployee[]
}

export interface IEmployee {
    "EmployeeCode": string,
    "Employee": string,
    "Leader": boolean
}

@Injectable({
  providedIn: 'root'
})

export class SmartsheetService {
  
  common_db : any;
  
  planning_db : any;
  
  public dates : BehaviorSubject<Moment[]> = new BehaviorSubject(undefined);
  
  public tasks : BehaviorSubject<ITask[]> = new BehaviorSubject(undefined);
  
  public assignations : BehaviorSubject<IAssignation> = new BehaviorSubject(undefined);
  
  public resetPlanning : EventEmitter<any> = new EventEmitter();
  
  constructor(private http : HttpClient) {
    this.common_db = new PouchDB('common');
    let remote_common_db = new PouchDB(`${db_url}/common`, {skip_setup: true});
    remote_common_db.logIn('timesheet_user','Socoma2020!');
    this.common_db.sync(remote_common_db, {live: true, retry: true, /* other sync options */});
    
    this.planning_db = new PouchDB('planning');
    let remote_planning_db = new PouchDB(`${db_url}/planning`, {skip_setup: true});
    remote_planning_db.logIn('timesheet_user','Socoma2020!');
    this.planning_db.sync(remote_planning_db, {live: true, retry: true, /* other sync options */}).on('error', console.log.bind(console));
    
    let bindvar = this;
    
    this.planning_db.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', function(change) {
      bindvar.assignations.next(change.doc);
    }).on('complete', function(info) {
      // changes() was canceled
    }).on('error', function (err) {
      console.log(err);
    });
    
    this.refreshTaskList();
  }
  
  getTeams() {
    return this.http.get<TeamResponse>(`${db_url}/common/employees`,httpOptionsCouchdb)
      .pipe(map(
          res => { 
            return res.teams;
          },
          error => {
            console.error('There was an error during the request');
            console.log(error);
          })
      );
  }
  
  refreshTaskList() {
    this.http.get<SmarsheetReportResponse>(`${smartsheet_url}/reports/5332129069459332`,httpOptions)
      .pipe(map(
          res => { 
            let tasks : ITask[] = [];
            res.rows.forEach(function(row) {
              tasks.push({
                TaskId : row.cells[1].value,
                Name : row.cells[2].value,
                Chantier : row.cells[3].value,
              })
            })
            tasks.push({
                TaskId : 'task_none',
                Name : 'Absent',
                Chantier : 'Absent',
            });
            return tasks;
          },
          error => {
            console.error('There was an error during the request');
            console.log(error);
          })
      ).subscribe(val => this.tasks.next(val));
  };
  
  resetDates() {
    this.dates.next([0,1,2,3,4].map(t => moment().add(t, 'days')));
    this.refreshPlanning();
  }

  nextDay() {
    this.dates.next(this.dates.value.map(t => t.add(1, 'days')));
    this.refreshPlanning();
  }
  
  previousDay() {
    this.dates.next(this.dates.value.map(t => t.add(-1, 'days')));
    this.refreshPlanning();
  }
  
  refreshPlanning() {
    this.resetPlanning.emit(null);
    let bindvar = this;
    this.planning_db.allDocs({
      include_docs: true,
      attachments: true
    }).then(function (result) {
      result.rows.map(val => {
        bindvar.assignations.next(val.doc);
      })
    }).catch(function (err) {
      console.log(err);
    });
  }
  
  updateAssignation(assignation : IAssignation) {
    this.planning_db.put(assignation,function (err, body) {
      if(err) {
        console.log("insert:", err, body);
      }
    });
  }
  
  addAssignation(employee : IEmployee, date : Moment, task : ITask) {
    this.planning_db.put({
        "_id": date.format('YYYY-MM-DD') + '-' + employee.EmployeeCode, 
        "Task": task, 
        "Employee": employee, 
        "Date": date.format('YYYY-MM-DD')
    }, function (err, body) {
        if(err) {
          console.log("insert:", err, body);
        }
      }
    );
  }
}
