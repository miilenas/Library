export class Book {
  constructor(
    public Id: string = "",
    public Title: string  = "",
    public Author: string  = "",
    public Description: string  = "",
    public PublishedYear: number=1800,
    // public userId: string,
  ) {}
}