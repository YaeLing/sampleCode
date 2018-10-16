import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';
import { AccountService} from './service/account.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  user:Observable<firebase.User>;
  constructor(private afAuth:AngularFireAuth,private accountService:AccountService){
     this.user=afAuth.authState;
  }
  logout(){
    this.accountService.logout();
  }
}
