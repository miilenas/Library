import { Component, OnInit } from '@angular/core';
import { ReadingService } from '../services/readings.service';
import { BooksService } from '../services/books.service';
import { Book } from '../models/book';
import { Reading, StatusEnum } from '../models/reading';
import { getAuth } from 'firebase/auth';
import { combineLatest, switchMap } from 'rxjs';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-readings',
  templateUrl: './readings.page.html',
  styleUrls: ['./readings.page.scss'],
  standalone: false,
})
export class ReadingsPage implements OnInit {
  books: Book[] = [];
  myread: Reading[]=[];
   StatusEnum = StatusEnum;

  constructor(
    private readingService: ReadingService,
    private bookService: BooksService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
  const userId = getAuth().currentUser?.uid;
  if (!userId) return;

  this.readingService.getReadingsForUser(userId).pipe(
    switchMap((readings: Reading[]) => {
      this.myread = readings; 
      if (readings.length === 0) {
        return [];
      }
      const bookObservables = readings.map(r => this.bookService.getBookById(r.BookId));
      console.log('Book observables:', bookObservables);
      return combineLatest(bookObservables);
    })
  ).subscribe({
    next: (books: Book[]) => {
      this.books = books;
      console.log('Fetched books:', this.books);
    },
    error: (error) => {
      console.error('Error fetching books:', error);
    }
  });
}

  getRatingForBook(bookId: string): number {
    const reading = this.myread.find(b => b.BookId === bookId);
    return reading ? reading.Grade : 0; 
  }

  async openRatingDialog(bookId: string) {
    const alert = await this.alertController.create({
      header: 'Rate Book',
      inputs: [
        {
          name: 'rating',
          type: 'number',
          placeholder: 'Enter your rating (1-5)',
          min: 1,
          max: 5
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Submit',
          handler: (data) => {
            this.submitRating(bookId, data.rating);
          }
        }
      ]
    });

    await alert.present();
  }

  // submitRating(bookId: string, rating: number) {
  //   const userId = getAuth().currentUser?.uid;
  //   if (userId) {
  //     this.readingService.updateRating(userId, bookId, rating).subscribe(() => {
  //       console.log('Rating submitted:', rating);
  //     });
  //   }
  // }
  submitRating(bookId: string, rating: number) {
  const userId = getAuth().currentUser?.uid;
  if (userId) {
    const reading = this.myread.find(r => r.BookId === bookId);
    if (!reading) return;

    this.readingService.updateRating(userId, bookId, rating).subscribe(() => {
      console.log('Rating submitted:', rating);

      if (reading.Comment && reading.Comment.trim() !== '') {
        this.readingService.updateStatus(userId, bookId, StatusEnum.Finished).subscribe(() => {
          console.log('Status updated to Finished');
        });
      }
    });
  }
}


submitComment(bookId: string, comment: string) {
  const userId = getAuth().currentUser?.uid;
  if (userId) {
    this.readingService.updateComment(userId, bookId, comment).subscribe(() => {
      console.log('Comment submitted:', comment);
    });
  }
}
async openCommentDialog(bookId: string) {
  const alert = await this.alertController.create({
    header: 'Leave a Comment',
    inputs: [
      {
        name: 'comment',
        type: 'textarea',
        placeholder: 'Your thoughts...'
      },
    ],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Submit',
        handler: (data) => {
          this.handleCommentSubmit(bookId, data.comment);
        }
      }
    ]
  });

  await alert.present();
}

handleCommentSubmit(bookId: string, comment: string) {
  const userId = getAuth().currentUser?.uid;
  if (userId) {
    const reading = this.myread.find(r => r.BookId === bookId);
    if (!reading) return;

    this.readingService.updateComment(userId, bookId, comment).subscribe(() => {
      console.log('Comment submitted:', comment);

      // Ako već postoji ocena, onda stavi status na Finished
      if (reading.Grade > 0) {
        this.readingService.updateStatus(userId, bookId, StatusEnum.Finished).subscribe(() => {
          console.log('Status updated to Finished');
        });
      }
    });
  }
}









}