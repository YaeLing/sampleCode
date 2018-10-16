import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import { AccountService } from './services/accountService';
import { ProductService } from './services/productService';
import { Account } from './model/account';

import * as firebase from 'firebase';

@Component({
    selector: 'login',
    templateUrl: './views/loginComponent.html',
    styleUrls: ['./views/app.component.css']
})
export class LoginComponent implements OnInit {

    authUser: Observable<firebase.User>;
    account: Observable<Account>;

    constructor(private router: Router,
        private auth: AngularFireAuth,
        private accountService: AccountService,
        private productService: ProductService) {

        this.authUser = this.auth.authState;
        this.authUser.subscribe(user => {
            if (user) {
                this.account = this.accountService.getAccount(user.uid);
                this.account.take(1).subscribe(account => {
                    if (!account) {
                        this.accountService.createAccount(user)
                            .then(() => { // 註冊、登入《集氣降價》
                                this.productService.updateProductsPrice(user, -1)
                                this.router.navigate(['/products'])
                            })
                            .catch(error => console.log("Create Account Error", error));
                    } else { // 登入《集氣降價》
                        this.productService.updateProductsPrice(user, -1)
                        this.router.navigate(['/products']);
                    }
                });
            }
        }, error => console.log("Subcribe Error", error));
    }

    ngOnInit() {

    }

}