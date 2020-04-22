import { Component, OnInit } from '@angular/core';

import { InvoiceService, IActivite, IChantier, IEmployee, ITeam} from '../invoice.service';

import { SmartsheetService } from '../smartsheet.service';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.css']
})
export class PlanComponent implements OnInit {

  teams : ITeam[];

  constructor(private is : InvoiceService, private sm : SmartsheetService) { }

  ngOnInit(): void {
    this.is.getTeams().subscribe(val => this.teams = val);
  }

}
