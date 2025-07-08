import { inject, Injectable } from '@angular/core';
import { Firestore, collectionData, collection, query, where, doc, updateDoc, setDoc } from '@angular/fire/firestore';
import { combineLatest, from, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Reading, StatusEnum } from '../models/reading';
 
@Injectable({
  providedIn: 'root'
})

export class ReadingService{
 private firestore = inject(Firestore);

getReadingsForUser(UserId: string): Observable<Reading[]> {
  const ref = collection(this.firestore, 'readings');
  const readingsQuery = query(ref, where('UserId', '==', UserId),
   where('Status', 'in', [StatusEnum.Reading,  StatusEnum.WantToRead, StatusEnum.Finished]));

 return collectionData(readingsQuery, { idField: 'Id' }).pipe(
    map((data) => {
      console.log('Fetched readings:', data); 
      return data.map(item => ({
        Id: item['Id'],
        UserId: item['UserId'],
        BookId: item['BookId'],
        Status: item['Status'],
        Grade: item['Grade'],
        Comment: item['Comment']
      }));
    })
  ) as Observable<Reading[]>;
}
  
 addBookToReadings(userId: string, bookId: string): Observable<void> {
       const ref = collection(this.firestore, 'readings');
    const checkQuery = query(ref, where('UserId', '==', userId), where('BookId', '==', bookId));

    return collectionData(checkQuery).pipe(
      take(1),
      switchMap((existing: any[]) => {
        if (existing.length > 0) {
          console.warn('Book already in readings');
          return of(void 0);
        }

        const readingData = {
          UserId: userId,
          BookId: bookId,
          Status: StatusEnum.WantToRead,
          Grade: 1,
          Comment: ''
        };

        const newDocRef = doc(ref); // auto-generisan ID
        return from(setDoc(newDocRef, readingData));
      })
    );
  }
  
updateRating(userId: string, bookId: string, rating: number): Observable<void> {
    const ref = collection(this.firestore, 'readings');
    const readingQuery = query(ref, where('UserId', '==', userId), where('BookId', '==', bookId));

    return collectionData(readingQuery, { idField: 'Id' }).pipe(
      take(1), 
      switchMap(readings => {
        if (readings.length > 0) {
          const readingDoc = doc(this.firestore, `readings/${readings[0]['Id']}`);
          return from(updateDoc(readingDoc, { Grade: rating })); 
        }
        return throwError(() => new Error('Reading not found')); 
      })
    );
  }
updateComment(userId: string, bookId: string, comment: string): Observable<void> {
  const ref = collection(this.firestore, 'readings');
  const q = query(ref, where('UserId', '==', userId), where('BookId', '==', bookId));

  return collectionData(q, { idField: 'Id' }).pipe(
    take(1),
    switchMap(readings => {
      if (readings.length > 0) {
        const readingDoc = doc(this.firestore, `readings/${readings[0]['Id']}`);
        return from(updateDoc(readingDoc, { Comment: comment }));
      }
      return throwError(() => new Error('Reading not found'));
    })
  );
}
updateStatus(userId: string, bookId: string, status: StatusEnum): Observable<void> {
  const ref = collection(this.firestore, 'readings');
  const q = query(ref, where('UserId', '==', userId), where('BookId', '==', bookId));

  return collectionData(q, { idField: 'Id' }).pipe(
    take(1),
    switchMap(readings => {
      if (readings.length > 0) {
        const readingDoc = doc(this.firestore, `readings/${readings[0]['Id']}`);
        return from(updateDoc(readingDoc, { Status: status }));
      }
      return throwError(() => new Error('Reading not found'));
    })
  );
}



}
