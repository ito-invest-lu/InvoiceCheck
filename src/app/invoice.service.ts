import { Injectable } from '@angular/core';
import { Http, Response } from "@angular/http";
import { environment } from '../environments/environment';
import "rxjs/Rx";
import {Observable} from "rxjs/Observable";

const url = environment.server;

export interface IInvoiceQuery {
    "Company": string,
    "Journal": string,
    "Number": string,
}

export interface IInvoice {
    "Number": string,
    "Date": Date,
    "Periode": number,
    "Fournisseur": string,
    "Chantier": string,
    "Activite": string,
    "Total": number
}

export interface IInvoicePDF {
    "Company": string,
    "Journal": string,
    "Number": string,
    "PDF" : string
}

export interface IChantier {
    "CantierCode": string,
    "Chantier": string
}

@Injectable({
  providedIn: 'root'
}) 

export class InvoiceService {

  public invoice : IInvoice;

  constructor(private http: Http) { }
  
  getChantiers() {
    return this.http.get(`${url}/chantiers`)
            .map((response: Response) => {
                 return <IChantier[]>response.json();
             })
             .catch(this.handleError);
  }
  
  getNumberList(query:IInvoiceQuery) {
    return this.http.get(`${url}/invoice_number?numero=${query.Number}&journal=${query.Journal}&company=${query.Company}`)
            .map((response: Response) => {
                 return <string[]>response.json().map(item => item.Number);
             })
             .catch(this.handleError);
  }
  
  getInvoiceList(query:IInvoiceQuery) {
    return this.http.get(`${url}/invoices?numero=${query.Number}&journal=${query.Journal}&company=${query.Company}`)
            .map((response: Response) => {
                 return <IInvoice[]>response.json();
             })
             .catch(this.handleError);
  }
  
  getInvoicePDFList(query:IInvoiceQuery) {
    return this.http.get(`${url}/invoice_pdfs?numero=${query.Number}&journal=${query.Journal}&company=${query.Company}`)
            .map((response: Response) => {
                 return <IInvoicePDF[]>response.json();
             })
             .catch(this.handleError);
  }
  
  private handleError(error: Response) {
    console.log(error);
    return Observable.throw(error.status + '-' + error.statusText);
  }
}
