import { Injectable, OnInit, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { take, map } from 'rxjs/operators';

import { Moment } from 'moment';
import * as moment from 'moment';

moment.locale('fr');

import PouchDB from 'pouchdb';
import PouchAuth from 'pouchdb-authentication';

PouchDB.plugin(PouchAuth)

const db_url = environment.db_server;

const smartsheet_url = "https://api.socomaconstruction.com/2.0";
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
  Budget : number,
  Usage : number,
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
  
  public log : EventEmitter<any> = new EventEmitter();
  
  public dates : BehaviorSubject<Moment[]> = new BehaviorSubject(undefined);
  
  public tasks : BehaviorSubject<ITask[]> = new BehaviorSubject(undefined);
  
  public assignations : BehaviorSubject<IAssignation> = new BehaviorSubject(undefined);
  
  public resetPlanning : EventEmitter<any> = new EventEmitter();
  
  constructor(private http : HttpClient) {
    
    let bindvar = this;
    
    this.common_db = new PouchDB('common');
    let remote_common_db = new PouchDB(`${db_url}/common`, {skip_setup: true});
    remote_common_db.logIn('timesheet_user','Socoma2020!');
    this.common_db.sync(remote_common_db, {live: true, retry: true, /* other sync options */});
    
    this.planning_db = new PouchDB('planning');
    let remote_planning_db = new PouchDB(`${db_url}/planning`, {skip_setup: true});
    remote_planning_db.logIn('timesheet_user','Socoma2020!');
    let planningSyncHandler = this.planning_db.sync(remote_planning_db, {live: true, retry: true, /* other sync options */})
      .on('change', function (info) {
        console.log("change");
        console.log(info);
        bindvar.log.emit(info);
      }).on('paused', function (err) {
        console.log("paused");
        console.log(err);
        // replication paused (e.g. replication up to date, user went offline)
      }).on('active', function () {
        console.log("active");
        // replicate resumed (e.g. new changes replicating, user went back online)
      }).on('denied', function (err) {
        console.log("denied");
        console.log(err);
        // a document failed to replicate (e.g. due to permissions)
      }).on('complete', function (info) {
        console.log("complete");
        console.log(info);
        // handle complete
      }).on('error', function (err) {
        console.log("error");
        console.log(err);
        // handle error
      });
    
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
    let usages = new Map<string, number>();
    this.planning_db.query('task/count',{group: true})
    .then(function (res) {
        let usages = new Map<string, number>();
        res.rows.map(
          row => usages.set(row.key, row.value)
        );
        return usages;
    }).then(function (usages : Map<string, number>) {
      binvar.http.get<SmarsheetReportResponse>(`${smartsheet_url}/reports/5332129069459332`,httpOptions)
        .pipe(map(
            res => { 
              let tasks : ITask[] = [];
              res.rows.forEach(function(row) {
                tasks.push({
                  TaskId : row.cells[1].value,
                  Name : row.cells[2].value,
                  Chantier : row.cells[3].value,
                  Color : binvar.hex(row.cells[3].value+row.cells[2].value),
                  Budget : parseInt(row.cells[4].value),
                  Usage : usages.get(row.cells[1].value) || 0,
                })
              })
              tasks.push({
                  TaskId : 'task_none',
                  Name : 'Absent',
                  Chantier : 'Absent',
                  Color : '#aaaa',
                  Budget : 0,
                  Usage : 0,
              });
              return tasks;
            },
            error => {
              console.error('There was an error during the request');
              console.log(error);
            })
        ).subscribe(val => binvar.tasks.next(val));
    }).catch(function (err) {
        console.log(err);
    });
  }

  fixTaskColor () {
    let binvar = this;
    this.planning_db.allDocs({
      include_docs: true,
      attachments: true
    }).then(function (result) {
      result.rows.map(val => {
        let item : IAssignation = val.doc;
        item.Task.Color = binvar.hex(item.Task.Chantier+item.Task.Name);
        binvar.planning_db.put(item,function (err, body) {
          if(err) {
            console.log("insert:", err, body);
          }
        });
      });
      binvar.refreshTaskList();
    }).catch(function (err) {
      console.log(err);
    });
  }

  addWeekdays(date : Moment, days : number) {
    while (days > 0) {
      date = date.add(1, 'days');
      // decrease "days" only if it's a weekday.
      if (date.isoWeekday() !== 6 && date.isoWeekday() !== 7) {
        days -= 1;
      }
    }
    return date;
  }
  
  substractWeekdays(date : Moment, days : number) {
    while (days < 0) {
      date = date.add(-1, 'days');
      // decrease "days" only if it's a weekday.
      if (date.isoWeekday() !== 6 && date.isoWeekday() !== 7) {
        days += 1;
      }
    }
    return date;
  }
  
  resetDates() {
    let today = moment();
    switch(today.isoWeekday()) { 
       case 6: { 
          this.dates.next([0,1,2,3,4].map(t => this.addWeekdays(moment().add(2, 'days'), t)));
          break; 
       } 
       case 7: { 
          this.dates.next([0,1,2,3,4].map(t => this.addWeekdays(moment().add(1, 'days'), t)));
          break; 
       } 
       default: { 
          this.dates.next([0,1,2,3,4].map(t => this.addWeekdays(moment(), t)));
          break; 
       } 
    }
    this.refreshPlanning();
  }

  nextDay() {
    this.dates.next(this.dates.value.map(t => this.addWeekdays(t, 1)));
    this.refreshPlanning();
  }
  
  previousDay() {
    this.dates.next(this.dates.value.map(t => this.substractWeekdays(t, -1)));
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
    this.refreshTaskList();
  }
  
  addAssignation(employee : IEmployee, date : Moment, task : ITask) {
    this.planning_db.put({
        "_id": date.format('YYYY-MM-DD') + '-' + employee.EmployeeCode, 
        "Task": task, 
        "Employee": employee, 
        "Date": date.format('YYYY-MM-DD')
    }, function (err, body) {
        if(err) {
          console.log("Failed insert:", err, body);
        }
      }
    );
    this.refreshTaskList();
  }
  
  copyDay(from : Moment, to : Moment) {
    let bindvar = this;
    this.planning_db.query('assignement/by_date',{key : from.format('YYYY-MM-DD') , include_docs: true})
    .then(function (res) {
      res.rows.map(entry => {
        bindvar.planning_db.put({
            "_id": to.format('YYYY-MM-DD') + '-' + entry.doc.Employee.EmployeeCode, 
            "Task": entry.doc.Task, 
            "Employee": entry.doc.Employee, 
            "Date": to.format('YYYY-MM-DD')
        }, function (err, body) {
            if(err) {
              console.log("Failed insert:", err, body);
            }
          }
        );
      })
    }).catch(function (err) {
      console.log(err);
    });
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
