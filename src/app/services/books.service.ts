import {  Injectable } from '@angular/core';
import {map, Observable } from 'rxjs';
import { Book } from '../models/book';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})

export class BooksService {
  constructor(private http: HttpClient) {}


  getBooks(): Observable<Book[]> {
     return this.http.get<Book[]>(`https://${environment.firebaseRDBUrl}/books.json`).pipe(
      map(response => {
        const books: Book[] = [];
        for (const key in response) {
          if (response.hasOwnProperty(key)) {
            books.push({ ...response[key], id: key });
          }
        }
        return books;
      })
    );
  }

  getBookById(bookId: string): Observable<Book> {
     return this.http.get<Book>(`https://${environment.firebaseRDBUrl}/books/${bookId}.json`).pipe(
       map(book => {
        return { ...book, id: bookId };
      })
    );
}
addBook(book: Omit<Book, 'id'>): Observable<{ name: string }> {
return this.http.post<{ name: string }>(`https://${environment.firebaseRDBUrl}/books.json`, book);
}


}
