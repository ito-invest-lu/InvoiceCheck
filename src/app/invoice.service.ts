import { Injectable } from '@angular/core';
import { Http, Response } from "@angular/http";
import { environment } from '../environments/environment';

import { BehaviorSubject, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

const url = environment.server;

export interface IInvoiceQuery {
    "Company": string,
    "Journal": string,
    "Number": string,
}

export interface IInvoice {
    "Company": string,
    "Journal": string,
    "Number": string,
    "Date": Date,
    "Periode": number,
    "Fournisseur": string,
    "Chantier": string,
    "Activite": string,
    "Total": number,
    "IsPaid": number,
}

export interface IInvoicePDF {
    "Company": string,
    "Journal": string,
    "Number": string,
    "PDF": string
}

export interface IChantier {
    "ChantierCode": string,
    "Chantier": string
}

export interface IActivite {
    "ActiviteCode": string,
    "Activite": string
}

@Injectable({
  providedIn: 'root'
}) 

export class InvoiceService {

  public invoice: BehaviorSubject<IInvoice> = new BehaviorSubject(undefined);
  
  public invoicePDF: BehaviorSubject<IInvoicePDF> = new BehaviorSubject(undefined);

  constructor(private http: Http) { }
  
  getActivites() {
    return this.http.get(`${url}/activites`)
            .pipe(map((response: Response) => {
                 return <IActivite[]>response.json();
             },
              error => {
                console.error('There was an error during the request');
                console.log(error);
              }));
  }
  
  getChantiers() {
    return this.http.get(`${url}/chantiers`)
            .pipe(map((response: Response) => {
                 return <IChantier[]>response.json();
             },
              error => {
                console.error('There was an error during the request');
                console.log(error);
              }));
  }
  
  getNumberList(query:IInvoiceQuery) {
    return this.http.get(`${url}/invoice_number?numero=${query.Number}&journal=${query.Journal}&company=${query.Company}`)
            .pipe(map((response: Response) => {
                 return <string[]>response.json().map(item => item.Number);
              },
              error => {
                console.error('There was an error during the request');
                console.log(error);
              }));
  }
  
  getInvoiceFromServer(query:IInvoiceQuery) {
    if(query.Number) {
      this.http.get(`${url}/invoices?numero=${query.Number}&journal=${query.Journal}&company=${query.Company}`)
        .subscribe(
          res => { 
            this.invoice.next(res.json()[0]);
          },
          error => {
            console.error('There was an error during the request');
            console.log(error);
          });
      this.http.get(`${url}/invoice_pdfs?numero=${query.Number}&journal=${query.Journal}&company=${query.Company}`)
        .subscribe(
          res => { 
            this.invoicePDF.next(res.json()[0]);
          },
          error => {
            console.error('There was an error during the request');
            console.log(error);
          });
    }
  }
  
  changeChantier(to_code: string) {
        this.invoice.pipe(take(1)).subscribe(value => {
          this.http.patch(`${url}/invoice_change_chantier?numero=${value.Number}&journal=${value.Journal}&company=${value.Company}&chantier_code=${to_code}`, {})
              .subscribe(
                res => { 
                  console.log('received ok response from patch request');
                  this.getInvoiceFromServer(value);
                },
                error => {
                  console.error('There was an error during the request');
                  console.log(error);
                });
        });
  }
  
  changeActivite(to_code: string) {
        this.invoice.pipe(take(1)).subscribe(value => {
          this.http.patch(`${url}/invoice_change_activite?numero=${value.Number}&journal=${value.Journal}&company=${value.Company}&activite_code=${to_code}`, {})
            .subscribe(
              res => { 
                console.log('received ok response from patch request');
                this.getInvoiceFromServer(value);
              },
              error => {
                console.error('There was an error during the request');
                console.log(error);
              });
        });
  }
  
  private handleError(error: Response) {
    console.log(error);
    return Observable.throw(error.status + '-' + error.statusText);
  }
}
