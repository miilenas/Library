export enum StatusEnum{
    WantToRead,
    Reading,
    Finished
}
export class Reading {
  constructor(
    public Id: string = "",
    public UserId: string  = "",
    public BookId: string  = "",
    public Status: StatusEnum  = StatusEnum.WantToRead,
    public Grade: number  = 1,
    public Comment: string  = "",
  ) {}
}