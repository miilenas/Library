import { inject, Injectable } from '@angular/core';
import { Firestore, collectionData, collection, query, where, doc, updateDoc, setDoc, deleteDoc } from '@angular/fire/firestore';
import { combineLatest, from, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Reading, StatusEnum } from '../models/reading';
import { getAuth } from 'firebase/auth';
 
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

 updateRating(readingId: string, rating: number): Observable<void> {
    const readingDoc = doc(this.firestore, `readings/${readingId}`);
    return from(updateDoc(readingDoc, { Grade: rating }));
  }

  updateComment(readingId: string, comment: string): Observable<void> {
    const readingDoc = doc(this.firestore, `readings/${readingId}`);
    return from(updateDoc(readingDoc, { Comment: comment }));
  }


 updateStatus(readingId: string, status: StatusEnum): Observable<void> {
    const readingDoc = doc(this.firestore, `readings/${readingId}`);
    return from(updateDoc(readingDoc, { Status: status }));
  }

deleteReading(readingId: string){
  const readingDocRef = doc(this.firestore, 'readings', readingId);
 // return deleteDoc(readingDocRef);
  return from(deleteDoc(readingDocRef));
}

updateRatingAndComment(reading: Reading, rating: number, comment: string): Observable<void> {
    const updateRating$ = this.updateRating(reading.Id, rating);
    const updateComment$ = this.updateComment(reading.Id, comment);

    return new Observable<void>(observer => {
      updateRating$.subscribe({
        next: () => {
          reading.Grade = rating;
          updateComment$.subscribe({
            next: () => {
              reading.Comment = comment;
              observer.next();
              observer.complete();
            },
            error: err => observer.error(err)
          });
        },
        error: err => observer.error(err)
      });
    });
  }









}
