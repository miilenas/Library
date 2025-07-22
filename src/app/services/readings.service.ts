import {Injectable } from '@angular/core';import {BehaviorSubject, map, Observable, of, switchMap, take } from 'rxjs';
import { Reading, StatusEnum } from '../models/reading';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
 
@Injectable({
  providedIn: 'root'
})

export class ReadingService{
  private readingsSubject = new BehaviorSubject<Reading[]>([]);
  public readings$ = this.readingsSubject.asObservable();
constructor(private http: HttpClient, private authService: AuthService) {}

 private getAuthParams() {
    const token = this.authService.getToken();
    let params = new HttpParams();
    if (token) {
      params = params.set('auth', token);
    }
    return params;
  }

getReadingsForUser(userId: string): Observable<Reading[]> {
   const params = this.getAuthParams()
      .set('orderBy', '"userId"')
      .set('equalTo', `"${userId}"`);
    
    return this.http.get<{ [key: string]: any }>(`https://${environment.firebaseRDBUrl}/readings.json`, { params }).pipe(
      map(responseData => {
        const readings = !responseData
            ? []
            : Object.entries(responseData).map(([id, data]: [string, any]) => ({
                id,
                userId: data.userId,
                bookId: data.bookId,
                status: data.status as StatusEnum,
                grade: data.grade,
                comment: data.comment
              }));
          this.readingsSubject.next(readings);
          return readings;
        })
      );
}
getReadingsStream(): Observable<Reading[]> {
    return this.readings$;
  }
  
addBookToReadings(userId: string, bookId: string): Observable<Reading> {
  return this.getReadingsForUser(userId).pipe(
    take(1),
    switchMap(readings => {
      if (readings.some(r => r.bookId === bookId)) {
        console.warn('Book already in readings');
        return of(null as any); 
      }

      const newReading: Omit<Reading, 'id'> = {
        userId,
        bookId,
        status: StatusEnum.WantToRead,
        grade: 0,
        comment: ''
      };

      return this.http.post<{ name: string }>(
        `https://${environment.firebaseRDBUrl}/readings.json`,
        newReading,
        { params: this.getAuthParams() }
      ).pipe(
            map(res => {
              const created: Reading = { id: res.name, ...newReading };
              const current = this.readingsSubject.getValue();
              this.readingsSubject.next([...current, created]);
              return created;
        })
          );
      })
    );
  }


  updateReading(readingId: string, updateData: Partial<Reading>): Observable<void> {
    return this.http.patch<void>(`https://${environment.firebaseRDBUrl}/readings/${readingId}.json`, updateData, {
      params: this.getAuthParams()
    });
  }

  updateRating(readingId: string, rating: number): Observable<void> {
    return this.updateReading(readingId, { grade: rating });
  }

  updateComment(readingId: string, comment: string): Observable<void> {
    return this.updateReading(readingId, { comment });
  }

  updateStatus(readingId: string, status: StatusEnum): Observable<void> {
    return this.updateReading(readingId, { status });
  }

  deleteReading(readingId: string): Observable<void> {
    return this.http.delete<void>(`https://${environment.firebaseRDBUrl}/readings/${readingId}.json`, {
      params: this.getAuthParams()
    });
  }

  updateRatingAndComment(reading: Reading, rating: number, comment: string): Observable<void> {
    return this.updateReading(reading.id, {
      grade: rating,
      comment: comment
    });
  }
addReading(userId: string, bookId: string, status: string, grade: string, comment: string) {
  const newReading = {
    userId,
    bookId,
    status,
    grade,
    comment
  };

  return this.http.post(
    `https://${environment.firebaseRDBUrl}/readings.json`,
    newReading
  );
}







}
