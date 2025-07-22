import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, throwError } from 'rxjs';

interface AuthResponseData {
  idToken: string;
  email: string;
  localId: string;
  expiresIn: string;
}

interface UserData {
  firstName?: string,
  lastName?: string,
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _isUserAuthenticated = false;
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }
  private loadUserFromStorage() {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) return;

    try {
      const userData = JSON.parse(userDataString);
      const loadedUser = new User(
        userData.firstName || '',
        userData.lastName || '',
        userData.email || '',
        userData.id || '',
        userData._token || '',
        userData.tokenExpirationDate ? new Date(userData.tokenExpirationDate) : null
      );
      this.userSubject.next(loadedUser);
    } catch (e) {
      console.error('Error loading user from localStorage:', e);
    }
  }

  get isUserAuthenticated(): boolean {
    return this._isUserAuthenticated;
  }

 private autoLogout(expirationDuration: number) {
    console.log('Setting auto-logout timer for', expirationDuration / 1000, 'seconds');
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }
  private handleAuthentication(
    firstName: string = '',
    lastName: string = '',
    email: string,
    userId: string,
    token: string,
    expiresIn: number,
  ) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(firstName, lastName, email, userId, token, expirationDate);
    this.userSubject.next(user);
    this._isUserAuthenticated = true;
    localStorage.setItem('userData', JSON.stringify(user)); 
    this.autoLogout(expiresIn * 1000); 
  }

  register(user: UserData): Observable<User> {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
      { email: user.email, password: user.password, returnSecureToken: true }
    ).pipe(
      switchMap(authData => {
        const userProfile = {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
        };
        return this.http.put(
          `https://${environment.firebaseRDBUrl}/users/${authData.localId}.json?auth=${authData.idToken}`,
          userProfile
        ).pipe(
          map(() => {
            this.handleAuthentication(
              userProfile.firstName, 
              userProfile.lastName,
              authData.email,
              authData.localId,
              authData.idToken,
              +authData.expiresIn,
            
            );
            return this.userSubject.getValue()!; 
          }),
          catchError(error => {
            console.error("Error writing user profile to Realtime Database:", error);
            return throwError(() => new Error('Registration failed: Could not save user profile.'));
          })
        );
      }),
      catchError(errorRes => {
        let errorMessage = 'An unknown error occurred!';
        if (errorRes.error && errorRes.error.error) {
          switch (errorRes.error.error.message) {
            case 'EMAIL_EXISTS':
              errorMessage = 'EMAIL_EXISTS';
              break;
            case 'OPERATION_NOT_ALLOWED':
              errorMessage = 'OPERATION_NOT_ALLOWED';
              break;
            case 'WEAK_PASSWORD':
              errorMessage = 'WEAK_PASSWORD';
              break;
            case 'INVALID_EMAIL':
              errorMessage = 'INVALID_EMAIL';
              break;
            default:
              errorMessage = errorRes.error.error.message;
              break;
          }
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  login(user: UserData): Observable<User> {
    return this.http.post<AuthResponseData>(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
      { email: user.email, password: user.password, returnSecureToken: true }
    ).pipe(
      switchMap(authData => {
        const tempExpirationDate = new Date(new Date().getTime() + +authData.expiresIn * 1000);
        const tempUser = new User('', '', authData.localId, authData.email, authData.idToken, tempExpirationDate);
        this.userSubject.next(tempUser); // Emituj privremenog korisnika da bi getToken() imao token

        return this.getUserProfile(authData.localId).pipe(
          map(profileUser => {
            this.handleAuthentication(
              profileUser.firstName,
              profileUser.lastName,
              authData.email,
              authData.localId,
              authData.idToken,
              +authData.expiresIn,
            );
            return this.userSubject.getValue()!; 
          }),
          catchError(error => {
            console.error("Error fetching user profile after login:", error);
            this.handleAuthentication(
              '',
              '',
              authData.email,
              authData.localId,
              authData.idToken,
              +authData.expiresIn
            ); 
            return throwError(() => new Error('Login successful, but could not load user profile.'));
          })
        );
      }),
      catchError(errorRes => {
        let errorMessage = 'An unknown error occurred!';
        if (errorRes.error && errorRes.error.error) {
          switch (errorRes.error.error.message) {
            case 'EMAIL_NOT_FOUND':
              errorMessage = 'auth/email-not-found';
              break;
            case 'INVALID_PASSWORD':
              errorMessage = 'auth/wrong-password';
              break;
            case 'USER_DISABLED':
              errorMessage = 'auth/user-disabled';
              break;
            default:
              errorMessage = errorRes.error.error.message;
              break;
          }
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout() {
    this.userSubject.next(null);
    this._isUserAuthenticated = false;
    localStorage.removeItem('userData'); 
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer); 
    }
    this.tokenExpirationTimer = null;
  }

  // getToken(): string | null {
  //   const user = this.userSubject.getValue();
  //   if (user) return user.token;
  //   return null;
  // }
  getToken(): string | null {
  const userDataString = localStorage.getItem('userData');
  if (!userDataString) return null;

  try {
    const userData = JSON.parse(userDataString);
    return userData._token || null;
  } catch {
    return null;
  }
}

  getUserId(): string | null {
    const user = this.userSubject.getValue();
    if (user) return user.id;
    return null;
  }

  getUserProfile(uid: string): Observable<User> {
    const idToken = this.getToken(); 
    if (!idToken) {
        return throwError(() => new Error('Authentication token is missing. User not authenticated.'));
    }

    return this.http.get<{firstName?: string, lastName?: string, email?: string}>( 
        `https://${environment.firebaseRDBUrl}/users/${uid}.json?auth=${idToken}`
    ).pipe(
        map(profileData => {
            let currentUser = this.userSubject.getValue();

            if (currentUser) {
                currentUser.firstName = profileData?.firstName || '';
                currentUser.lastName = profileData?.lastName || '';
                return currentUser;
            } else {
                console.warn('getUserProfile called without current user in BehaviorSubject. Creating new User object.');
            
                return new User(
                    profileData?.firstName || '',
                    profileData?.lastName || '',
                    profileData?.email || '',
                    uid,
                    idToken, 
                    null 
                );
            }
        }),
        catchError(error => {
            console.error("Error fetching user profile from Realtime Database:", error);
            return throwError(() => new Error('Failed to load user profile from database.'));
        })
    );
  }
}