export enum Status{
    WantToRead,
    Reading,
    Finished
}
export class Reading {
  constructor(
    public id: string = "",
    public userId: string  = "",
    public bookId: string  = "",
    public status: Status  = Status.WantToRead,
    public grade: number  = 1,
    public comment: string  = "",
  ) {}
}