import { Component, OnInit } from '@angular/core';
import { ReadingService } from '../services/readings.service';
import { BooksService } from '../services/books.service';
import { Book } from '../models/book';
import { Reading, StatusEnum } from '../models/reading';
import { getAuth } from 'firebase/auth';
import { combineLatest, switchMap } from 'rxjs';
import { AlertController, ToastController } from '@ionic/angular';

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
    private alertController: AlertController,
    private toastController: ToastController,
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
      return combineLatest(bookObservables);
    })
  ).subscribe({
    next: (books: Book[]) => {
      this.books = books;
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

deleteReading(bookId: string) {
  const userId = getAuth().currentUser?.uid;
  if (!userId) return;

  const reading = this.myread.find(r => r.BookId === bookId);
  if (!reading) return;

  this.readingService.deleteReading(reading.Id).subscribe({
    next: () => {
      console.log('Reading deleted');
      this.myread = this.myread.filter(r => r.BookId !== bookId);
      this.books = this.books.filter(b => b.Id !== bookId);
    },
    error: (err) => console.error('Error deleting reading', err)
  });
}
getAlertButtons(bookId: string) {
  return [
    {
      text: 'No',
      role: 'cancel'
    },
    {
      text: 'Yes',
      handler: () => {
        this.deleteReading(bookId);
      }
    }
  ];
}

setResult(ev: any) {
  console.log('Alert dismissed', ev);
}

async presentToast(message: string, color: 'success' | 'danger' = 'success') {
  const toast = await this.toastController.create({
    message,
    duration: 2000,
    color,
    position: 'bottom'
  });

  await toast.present();
}

async openImpressionDialog(bookId: string) {
  const reading = this.myread.find(r => r.BookId === bookId);
  if (!reading) return;

  const alert = await this.alertController.create({
    header: 'Your impression',
    inputs: [
      {
        name: 'rating',
        type: 'text',
        placeholder: 'Enter your rating (1–5)',
        value: reading.Grade > 1 ? reading.Grade.toString() : ''
      },
      {
        name: 'comment',
        type: 'textarea',
        placeholder: 'Share your thoughts...',
        value: reading.Comment || ''
      }
    ],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Save',
        handler: (data) => {
          if (this.validateImpression(data.rating, data.comment)) {
    this.saveImpression(reading, parseInt(data.rating), data.comment);
    return true; 
  }
  return false;
        }
      }
    ]
  });

  await alert.present();
}
saveImpression(reading: Reading, rating: number, comment: string) {
  this.readingService.updateRatingAndComment(reading, rating, comment).subscribe({
    next: () => {
      reading.Grade = rating;
      reading.Comment = comment;
      if (rating > 0 && comment.trim() !== '') {
        this.readingService.updateStatus(reading.Id, StatusEnum.Finished).subscribe(() => {
          reading.Status = StatusEnum.Finished;
          this.presentToast('Saved your impression!');
        });
      } else {
        this.presentToast('Saved your impression!');
      }
    },
    error: (err) => {
      console.error('Error saving impression:', err);
    }
  });
}

validateImpression(rating: any, comment: string): boolean {
  const parsedRating = parseInt(rating);
  
  if (!rating || !comment || rating.toString().trim() === '' || comment.trim() === '') {
    this.presentToast('All fields are required.', 'danger');
    return false;
  }

  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    this.presentToast('Rating must be a number between 1 and 5.', 'danger');
    return false;
  }

  if (!comment || comment.trim().length < 3) {
    this.presentToast('Comment must be at least 3 characters long.', 'danger');
    return false;
  }

  return true;
}











}