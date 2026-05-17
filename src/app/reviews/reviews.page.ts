import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { Reading } from '../models/reading';
import { ActivatedRoute } from '@angular/router';
import { ReadingService } from '../services/readings.service';
import { BooksService } from '../services/books.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.page.html',
  styleUrls: ['./reviews.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})

export class ReviewsPage implements OnInit {
    bookId: string = '';
  bookTitle: string = '';
  reviews: Reading[] = [];

  constructor(
    private route: ActivatedRoute,
    private readingService: ReadingService,
    private bookService: BooksService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.bookId = this.route.snapshot.paramMap.get('bookId') || '';

    this.bookService.getBookById(this.bookId).subscribe({
      next: (book) => {
        this.bookTitle = book.title;
      },
      error: (err) => console.error(err)
    });

    this.readingService.getReviewsForBook(this.bookId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (err) => console.error(err)
    });
  }

  goBack() {
    this.navCtrl.back();
  }

get averageGrade(): string {
  if (this.reviews.length === 0) return '';
  const sum = this.reviews.reduce((acc, r) => acc + r.grade, 0);
  return (sum / this.reviews.length).toFixed(1);
}

}
