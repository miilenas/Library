export class Book {
  constructor(
    public id: string = "",
    public title: string  = "",
    public author: string  = "",
    public description: string  = "",
    public publishedYear: number=1800,
    // public userId: string,
  ) {}
}