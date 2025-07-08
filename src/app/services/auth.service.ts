import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from '@angular/fire/auth';
import { Observable } from 'rxjs'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // user$: Observable<User | null>;

  // constructor(private auth: Auth) {
  //   this.user$ = new Observable<User | null>(observer => {
  //     this.auth.onAuthStateChanged(user => {
  //       observer.next(user);
  //     });
  //   });
  // }

   user$: Observable<User | null>;

  constructor(private auth: Auth) {
    this.user$ = new Observable<User | null>(observer => {
      const unsubscribe = this.auth.onAuthStateChanged(user => {
        observer.next(user);
      });
      return { unsubscribe };
    });
  }
  /**
   * Registruje novog korisnika sa emailom i lozinkom.
   * @param email Email korisnika.
   * @param password Lozinka korisnika.
   * @returns Promise sa UserCredential objektom.
   */
  async register(email: string, password: string): Promise<any> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential;
    } catch (error) {
      console.error("Error to register:", error);
      throw error; 
    }
  }

  /**
   * Prijavljuje postojećeg korisnika sa emailom i lozinkom.
   * @param email Email korisnika.
   * @param password Lozinka korisnika.
   * @returns Promise sa UserCredential objektom.
   */
  async login(email: string, password: string): Promise<any> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential;
    } catch (error) {
      console.error("Error to login:", error);
      throw error;
    }
  }

  /**
   * Odjavljuje trenutno prijavljenog korisnika.
   * @returns Promise<void>
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error("Error to logout:", error);
      throw error;
    }
  }

  /**
   * Dohvata UID trenutno prijavljenog korisnika.
   * @returns UID korisnika (string) ili null ako niko nije prijavljen.
   */
  // getCurrentUserUid(): string | null {
  //   return this.auth.currentUser ? this.auth.currentUser.uid : null;
  // }
  getCurrentUserUid(): string | null {
  let uid: string | null = null;
  this.user$.subscribe(user => {
    uid = user ? user.uid : null;
  });
  return uid;
}
}