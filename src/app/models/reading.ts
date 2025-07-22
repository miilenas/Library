export enum StatusEnum{
    WantToRead,
    Reading,
    Finished
}
export class Reading {
  constructor(
    public id: string = "",
    public userId: string  = "",
    public bookId: string  = "",
    public status: StatusEnum  = StatusEnum.WantToRead,
    public grade: number  = 0,
    public comment: string  = "",
  ) {}
}