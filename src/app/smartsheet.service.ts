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
  Color : string,
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
    let binvar = this;
    this.http.get<SmarsheetReportResponse>(`${smartsheet_url}/reports/5332129069459332`,httpOptions)
      .pipe(map(
          res => { 
            let tasks : ITask[] = [];
            //https://timesheet_user:Socoma2020!@couchdb.socomaconstruction.com/planning/_design/ass_by_task/_view/ass_by_task_view?group=true
            res.rows.forEach(function(row) {
              tasks.push({
                TaskId : row.cells[1].value,
                Name : row.cells[2].value,
                Chantier : row.cells[3].value,
                Color : binvar.hex(row.cells[1].value),
              })
            })
            tasks.push({
                TaskId : 'task_none',
                Name : 'Absent',
                Chantier : 'Absent',
                Color : '#aaaa',
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
  
  
  hash(input : string) {
    let seed = 131;
    let seed2 = 137;
    let hash = 0;
    // make hash more sensitive for short string like 'a', 'b', 'c'
    input += 'x';
    // Note: Number.MAX_SAFE_INTEGER equals 9007199254740991
    let MAX_SAFE_INTEGER = 9007199254740991 / seed2;
    for(let i = 0; i < input.length; i++) {
        if(hash > MAX_SAFE_INTEGER) {
            hash = hash / seed2;
        }
        hash = hash * seed + input.charCodeAt(i);
    }
    return hash;
  }
  
  private hueRanges = { min : 0, max : 360};
  
  /**
   * Returns the hash in [h, s, l].
   * Note that H ∈ [0, 360); S ∈ [0, 1]; L ∈ [0, 1];
   *
   * @param {String} str string to hash
   * @returns {Array} [h, s, l]
   */
  hsl(str : string) : Array<number> {
      var H, S, L;
      var hash = this.hash(str);
  
      H = hash % 359;
      hash = (hash / 360);
      S = 0.5;
      L = 0.5;
  
      return [H, S, L];
  }
  
  /**
   * Returns the hash in [r, g, b].
   * Note that R, G, B ∈ [0, 255]
   *
   * @param {String} str string to hash
   * @returns {Array} [r, g, b]
   */
  rgb(str : string) {
      var hsl = this.hsl(str);
      return this.HSL2RGB(hsl);
  };
  
  /**
   * Returns the hash in hex
   *
   * @param {String} str string to hash
   * @returns {String} hex with #
   */
  hex(str : string) {
      var rgb = this.rgb(str);
      return this.RGB2HEX(rgb);
  };
  
  /**
   * Convert RGB Array to HEX
   *
   * @param {Array} RGBArray - [R, G, B]
   * @returns {String} 6 digits hex starting with #
   */
  RGB2HEX(RGBArray : Array<number>) {
      var hex = '#';
      RGBArray.forEach(function(value) {
          if (value < 16) {
              hex += 0;
          }
          hex += value.toString(16);
      });
      return hex;
  };
  
  /**
   * Convert HSL to RGB
   *
   * @see {@link http://zh.wikipedia.org/wiki/HSL和HSV色彩空间} for further information.
   * @param {Number} H Hue ∈ [0, 360)
   * @param {Number} S Saturation ∈ [0, 1]
   * @param {Number} L Lightness ∈ [0, 1]
   * @returns {Array} R, G, B ∈ [0, 255]
   */
   HSL2RGB(HSL : Array<number>) : Array<number> {
      let H = HSL[0];
      let S = HSL[1];
      let L = HSL[2];
      H /= 360;
  
      var q = L < 0.5 ? L * (1 + S) : L + S - L * S;
      var p = 2 * L - q;
  
      return [H + 1/3, H, H - 1/3].map(function(color) {
          if(color < 0) {
              color++;
          }
          if(color > 1) {
              color--;
          }
          if(color < 1/6) {
              color = p + (q - p) * 6 * color;
          } else if(color < 0.5) {
              color = q;
          } else if(color < 2/3) {
              color = p + (q - p) * 6 * (2/3 - color);
          } else {
              color = p;
          }
          return Math.round(color * 255);
      });
  };
  
}
