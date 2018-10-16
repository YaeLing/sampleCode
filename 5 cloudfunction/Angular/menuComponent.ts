import { Component, OnInit } from '@angular/core';

import { AngularFireAuth } from 'angularfire2/auth';

import { AccountService } from './services/accountService';
import { ProductService } from './services/productService';
import { Observable } from 'rxjs/Observable';
import { Account } from './model/account';

import * as firebase from 'firebase';

@Component({
    selector: 'authentication',
    templateUrl: './views/menuComponent.html',
    styleUrls: ['./views/app.component.css']
})
export class MenuComponent implements OnInit {

    authUser: Observable<firebase.User>;
    account: Account = null;
    user: firebase.User;

    isLogged: boolean = false;

    constructor(private auth: AngularFireAuth,
        private accountService: AccountService,
        private productService: ProductService) {

        this.authUser = this.auth.authState;
        this.authUser.subscribe(user => {
            if (user) {
                this.user = user;
                this.isLogged = true;
                this.accountService.getAccount(user.uid).subscribe(account => {
                    if (this.account && !account) {
                        this.singOut();
                    } // if

                    this.account = account;
                });
            } else {
                this.isLogged = false;
                this.account = null;
            }
        }, error => console.log("Get User Error", error));
    }

    ngOnInit() {

    }

    singOut() {
        console.log(this.user)
        this.productService.updateProductsPrice(this.user, 1);
        this.auth.auth.signOut()
        .catch(error => console.log("Sign Out Error", error));
    }

}
