import { Injectable }     from '@angular/core';
import { Http, Headers } from '@angular/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';


@Injectable()
export class ContentService {
  constructor(private http:Http) {
  }

  getContent(url) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return this.http.get(url, {headers: headers}).map(res => res.json());
  }
}