import { Component, OnInit } from '@angular/core';
import { BooksService } from '../services/books.service';
import { Book } from '../models/book';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ReadingService } from '../services/readings.service';
import { Reading } from '../models/reading';
import { AlertController, ToastController } from '@ionic/angular';

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
  showSearch: boolean = false;
  allBooks: Book[] = [];          
  filteredBooks: Book[] = [];
  searchTerm: string = '';
  constructor(
    private booksService: BooksService,
    private readingService: ReadingService,
    private authService: AuthService,
    private alertController: AlertController,
    private toastController: ToastController

  ) { }

  ngOnInit() {
     this.authService.user$.subscribe(user => {
      if (user) {
      this.userId =  user.id;
      localStorage.setItem('userData', JSON.stringify(user));
      this.loadReadings();
      }else{
      const storedUser = localStorage.getItem('userData');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          this.userId = parsedUser.id || null;
          if (this.userId) {
            this.loadReadings();
          }
        } catch (e) {
          console.error('Greška pri parsiranju localStorage user-a:', e);
          this.userId = null;
        }
      } else {
        this.userId = null;
      }
    }
  });

    this.books$ = this.booksService.getBooks();
    this.books$.subscribe(books => {
      this.allBooks = books;
      this.filteredBooks = books;
      this.noBooks = books.length === 0;
    });
  }
loadReadings() {
  if (this.userId) {
    this.readingService.getReadingsForUser(this.userId).subscribe(readings => {
      this.readings = readings;
    });
  }
}
 addBookToReadings(bookId: string) {
  if (this.userId) {
      if (this.readings.find(r => r.bookId === bookId)) {
        console.warn('Book already in readings');
        return;
      }
    this.readingService.addBookToReadings(this.userId, bookId).subscribe({
      next: () => {
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
           const validationError = this.validateBookData(data);
          if (validationError) {
            this.showToast(validationError, 'danger');
            return false;
          }
          this.addNewBook(data);
          this.showToast('Book added successfully!', 'success');
          return true;
        }
      }
    ]
  });

  await alert.present();
}

addNewBook(data: any) {
    const newBook: Book = {
      id: '', 
      title: data.title,
      author: data.author,
      description: data.description,
      publishedYear: parseInt(data.year, 10) || 0
    };

  this.booksService.addBook(newBook).subscribe({
    next: () => {
        this.booksService.getBooks().subscribe(books => {
        this.allBooks = books;
        this.filteredBooks = books;
        this.noBooks = books.length === 0;
      });
    },
    error: (err) => console.error('Error adding book:', err)
  });
}
isBookInReadings(bookId: string): boolean {
  return this.readings.some(r => r.bookId === bookId);
}

toggleSearch() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.filteredBooks = this.allBooks;
      this.searchTerm = '';
    }
  }

  filterBooks() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredBooks = this.allBooks.filter(book =>{
      const words = book.title.toLowerCase().split(' ');
    return words.some(word => word.startsWith(term));
  });
  }
async showToast(message: string, color: 'success' | 'danger' = 'success') {
  const toast = await this.toastController.create({
    message,
    duration: 2000,
    color,
    position: 'bottom'
  });
  toast.present();
}
validateBookData(data: any): string | null {
  if (!data.title || !data.author || !data.description || !data.year) {
    return 'All fields are required.';
  }
  const year = parseInt(data.year, 10);
  if (isNaN(year) || year>2025) {
    return 'Published year must be in the past.';
  } 
   if (isNaN(year) || year<1000) {
    return 'Published year must be a positive number.';
  } 
  if (data.title.length<=3 ){
    return 'Title must have at least 4 characters!'
  }
  if (data.author.length<=3 ){
    return 'Author must have at least 4 characters!'
  }
  if (data.description.length<=3 ){
    return 'Description must have at least 4 characters!'
  }

  return null;
}
// getBookById(bookId: string): Observable<Book> {
//   const params = new HttpParams().set('auth', this.authService.getToken() || '');
//   return this.http.get<Book>(`${this.baseUrl}/${bookId}.json`, { params });
// }






}
