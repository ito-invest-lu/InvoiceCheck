import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { take, map } from 'rxjs/operators';

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
  Team : string,
  Chantier : string,
};

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
  
  constructor(private http : HttpClient) {}
  
  getTeams() {
    return this.http.get<TeamResponse>(`${db_url}/timesheet/employees`,httpOptionsCouchdb)
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
  
  getTaskList() {
    return this.http.get<SmarsheetReportResponse>(`${smartsheet_url}/reports/5332129069459332`,httpOptions)
      .pipe(map(
          res => { 
            let tasks : ITask[] = [];
            res.rows.forEach(function(row) {
              tasks.push({
                TaskId : row.cells[1].value,
                Name : row.cells[2].value,
                Team : row.cells[1].displayValue,
                Chantier : row.cells[4].value,
              })
            })
            tasks.push({
                TaskId : 'task_none',
                Name : 'Absent',
                Team : '',
                Chantier : '',
            });
            return tasks;
          },
          error => {
            console.error('There was an error during the request');
            console.log(error);
          })
      )
  };
  
}
