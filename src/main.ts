import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

//   import { bootstrapApplication } from '@angular/platform-browser';
// import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
// import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

// import { environment } from './environments/environment'; 

// import { routes } from './app/app-routing.module';
// import { AppComponent } from './app/app.component';

// import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
// import { provideFirestore, getFirestore } from '@angular/fire/firestore';
// import { provideAuth, getAuth } from '@angular/fire/auth';


// bootstrapApplication(AppComponent, {
//   providers: [
//     { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
//     provideIonicAngular(),
//     provideRouter(routes, withPreloading(PreloadAllModules)),

//     provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
//     provideFirestore(() => getFirestore()),
//     provideAuth(() => getAuth())
//   ],
// });
