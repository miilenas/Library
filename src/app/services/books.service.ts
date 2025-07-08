import { inject, Injectable } from '@angular/core';
import { Firestore, collectionData, collection, doc, docData, addDoc } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { Book } from '../models/book';


@Injectable({
  providedIn: 'root'
})

export class BooksService {

   private firestore = inject(Firestore);

  getBooks(): Observable<Book[]> {
    const booksCollection = collection(this.firestore, 'books');
    return collectionData(booksCollection, { idField: 'Id' }) as Observable<Book[]>;
  }

  getBookById(bookId: string): Observable<Book> {
     console.log('Pozivam getBookById sa ID:', bookId);
  const ref = doc(this.firestore, `books/${bookId}`);
  return docData(ref, { idField: 'Id' }) as Observable<Book>;
}
addBook(book: Book): Observable<void> {
  const ref = collection(this.firestore, 'books');
  const bookData = {
    Title: book.Title,
    Author: book.Author,
    Description: book.Description,
    PublishedYear: book.PublishedYear
  };
  return from(addDoc(ref, bookData)).pipe(map(() => void 0));
}


}
