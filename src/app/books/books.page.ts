import { Component, OnInit } from '@angular/core';
import { BooksService } from '../services/books.service';
import { Book } from '../models/book';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ReadingService } from '../services/readings.service';
import { Reading } from '../models/reading';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-books',
  templateUrl: './books.page.html',
  styleUrls: ['./books.page.scss'],
  standalone:false
})
export class BooksPage implements OnInit {

   books$: Observable<Book[]> | undefined;
    noBooks: boolean = false;
    userId: string | null = null;
    readings: Reading[] = [];

  constructor(
    private booksService: BooksService,
    private readingService: ReadingService,
    private authService: AuthService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
      // this.userId = this.authService.getCurrentUserUid();
      // console.log('Current User ID:', this.userId);
    this.authService.user$.subscribe(user => {
    this.userId = user ? user.uid : null; 
    console.log('Current User ID:', this.userId);
    this.loadReadings()
  });

    this.books$ = this.booksService.getBooks();
    this.books$.subscribe(books => {
      this.noBooks = books.length === 0;
    });
  }
loadReadings() {
  if (this.userId) {
    this.readingService.getReadingsForUser(this.userId).subscribe(readings => {
      console.log('Readings:', readings); // Logovanje učitanih reading-a
      this.readings = readings;
    });
  }
}

 addBookToReadings(bookId: string) {
  if (this.userId) {
      if (this.readings.find(r => r.BookId === bookId)) {
        console.warn('Book already in readings');
        return;
      }
    this.readingService.addBookToReadings(this.userId, bookId).subscribe({
      next: () => {
        console.log('Book added to readings');
         this.loadReadings(); 
      },
      error: (error) => {
        console.error('Error adding book to readings', error);
      }
    });
  } else {
    console.error('User is not authenticated');
  }
}
async openAddBookDialog() {
  const alert = await this.alertController.create({
    header: 'Add New Book',
    inputs: [
      { name: 'title', type: 'text', placeholder: 'Title' },
      { name: 'author', type: 'text', placeholder: 'Author' },
      { name: 'description', type: 'textarea', placeholder: 'Description' },
      { name: 'year', type: 'number', placeholder: 'Published Year', min: 0 }
    ],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Add',
        handler: (data) => {
          this.addNewBook(data);
        }
      }
    ]
  });

  await alert.present();
}

addNewBook(data: any) {
  const newBook: Book = new Book();
  newBook.Title = data.title;
  newBook.Author = data.author;
  newBook.Description = data.description;
  newBook.PublishedYear = parseInt(data.year, 10) || 0;

  this.booksService.addBook(newBook).subscribe({
    next: () => {
      console.log('Book added successfully');
      this.books$ = this.booksService.getBooks(); // osveži listu
    },
    error: (err) => console.error('Error adding book:', err)
  });
}








}
