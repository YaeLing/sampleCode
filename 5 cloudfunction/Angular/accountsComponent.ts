import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';

import { ProductService } from './services/productService';
import { AccountService } from './services/accountService';

import { Account } from './model/account';
import { BuyRecord } from './model/buyRecord';
import { BalanceRecord } from './model/balanceRecord';

import * as Papa from 'papaparse';

@Component({
    selector: 'accounts',
    templateUrl: './views/accountsComponent.html',
    styleUrls: ['./views/app.component.css']
})

export class AccountsComponent implements OnInit {

    user: firebase.User;
    authUser: Observable<firebase.User>;
    loggedAccount: Account = null;

    accounts: Observable<Account[]>;

    selectedAccount: Account = null;
    detailVisible: boolean = false;
    increaseBalanceVisible: boolean = false;
    deleteVisible: boolean = false;
    @Input() accountDetail: Account;
    @Input() changeAmount: number;
    time: string = "";

    buyRecords: Observable<BuyRecord[]>;
    buyRecordVisible: boolean = false;
    buyRecordsCount: number = 0;
    buyRecordSum: number = 0;

    balanceRecords: Observable<BalanceRecord[]>;
    balanceRecordVisible: boolean = false;
    balanceMessageVisible: boolean = false;
    balanceRecordsCount: number = 0;
    balanceRecordSum: number = 0;

    constructor(private router: Router,
        private auth: AngularFireAuth,
        private productService: ProductService,
        private accountService: AccountService) {

        this.authUser = this.auth.authState;
        this.authUser.subscribe(user => {
            this.user = user;
            if (user) {
                this.accountService.getAccount(user.uid).subscribe(account => {
                    this.loggedAccount = account;
                    this.getAccounts();
                });
            } else {
                this.loggedAccount = null;
                this.router.navigate(["/products"]);
            }
        }, error => console.log("Get User Error", error));

    }

    ngOnInit(): void {

    }

    getAccounts(): void {
        this.accounts = this.accountService.getAccounts().map(accounts => {
            return accounts.filter(account => {
                if (this.loggedAccount.firebaseId == account.firebaseId)
                    return true;
                if (this.loggedAccount.role == "manager")
                    return true;
                else if (this.loggedAccount.role == "staff")
                    return account.role != "manager";
            }).sort((a: Account, b: Account) => this.sortFunction(a, b))
        });
    }

    getAccountDetail(account: Account): void {
        this.hideBuyRecords();
        this.hideBalanceRecords();
        this.hideAccountDetail();
        this.accountDetail = {
            firebaseId: account.firebaseId,
            name: account.name,
            role: account.role,
            balance: account.balance,
            phone: account.phone,
            email: account.email
        };
        this.detailVisible = true;
    }

    importAccountsByFile(event: any): void {
        var self = this;
        var fileReader: FileReader = new FileReader();
        var accountsFile: File = event.target.files[0];
        Papa.parse(accountsFile, {
            header: true,
            delimiter: ",",
            skipEmptyLines: true,
            complete: (result) => {
                self.accountService.importAccounts(result.data, this.user);
            }
        });
        event.target.value = "";
    }

    hideAccountDetail(): void {
        this.accountDetail = null;
        this.changeAmount = null;
        this.detailVisible = false;
        this.increaseBalanceVisible = false;
        this.deleteVisible = false;
    }

    showIncreaseBalanceForm(account: Account): void {
        this.hideBuyRecords();
        this.hideBalanceRecords();
        this.hideAccountDetail();
        this.increaseBalanceVisible = true;
        this.accountDetail = {
            name: account.name,
            balance: account.balance,
            phone: account.phone,
            email: account.email,
            role: account.role,
            firebaseId: account.firebaseId
        };
    }

    increaseBalance(account: Account, changeAmount: number): void {
        if (changeAmount < 0) return;

        this.accountService.updateBalance(changeAmount, this.user).then(() => {
            this.showBalanceRecords(account)
            this.balanceMessageVisible = true;
            this.accountService.getTime(this.user).then(result => {
                var time = result.json().time;
                var ONE_SEC = 1000;
                var ONE_MIN = ONE_SEC * 60;
                var ONE_HOUR = ONE_MIN * 60;
                var ONE_DADY = ONE_HOUR * 24;

                var timeValue = "";
                var days = Math.floor(time / ONE_DADY)
                if (days > 0) {
                    time = time - days * ONE_DADY;
                    timeValue += `${days}天`;
                }
                var hours = Math.floor(time / ONE_HOUR)
                if (hours > 0) {
                    time = time - hours * ONE_HOUR;
                    timeValue += `${hours}時`;
                }
                var mins = Math.floor(time / ONE_MIN)
                if (mins > 0) {
                    time = time - mins * ONE_MIN;
                    timeValue += `${mins}分`;
                }
                var secs = Math.floor(time / ONE_SEC)
                if (secs > 0) {
                    time = time - secs * ONE_SEC;
                    timeValue += `${secs}秒`;
                }

                this.time = timeValue;
            }).catch(err => this.time = "")
        }).catch(error => console.log("Buy Product Error", error));
    }

    updateAccount(account: Account): void {
        this.accountService.updateAccount(account, this.user)
            .then(() => this.hideAccountDetail())
            .catch(error => console.log("Update Account Error", error));
    }

    showBuyRecords(account: Account): void {
        this.hideBalanceRecords();
        this.hideAccountDetail();
        this.selectedAccount = account;
        this.buyRecordVisible = true;
        this.buyRecords = this.accountService.getBuyRecords(account).map(buyRecords => {
            this.buyRecordSum = 0;
            this.buyRecordsCount = buyRecords.length;
            buyRecords.forEach(buyRecord => this.buyRecordSum += buyRecord.productPrice);
            return buyRecords.slice(0, 10);
        });

        this.accountService.getAccount(account.firebaseId).subscribe(account => {
            if (!account)
                this.hideBuyRecords();
        });
    }

    hideBuyRecords(): void {
        this.selectedAccount = null;
        this.buyRecords = null;
        this.buyRecordVisible = false;
    }

    showBalanceRecords(account: Account): void {
        this.hideAccountDetail();
        this.hideBuyRecords();
        this.selectedAccount = account;
        this.balanceRecordVisible = true;
        this.balanceRecords = this.accountService.getBalanceRecords(account).map(records => {
            this.balanceRecordsCount = records.length;
            this.balanceRecordSum = records.length == 0 ? 0 : records[0].newBalance;
            return records.slice(0, 10);
        })
    }

    hideBalanceRecords(): void {
        this.selectedAccount = null;
        this.balanceRecords = null;
        this.balanceRecordVisible = false;
    }

    showDeleteForm(account: Account): void {
        this.hideBuyRecords();
        this.hideBalanceRecords();
        this.hideAccountDetail();
        this.accountDetail = account;
        this.deleteVisible = true;
    }

    deleteAccount(account: Account): void {
        this.productService.updateProductsPrice(this.user, 1);
        this.accountService.deleteAccount(account, this.user).then(() => {
            this.hideAccountDetail();
        }).catch(error => console.log("Delete Account Error: ", error));
    }

    private sortFunction(a: Account, b: Account): number {
        if (a.role == "manager") return -1;
        else if (a.role == "staff") {
            if (b.role == "manager") return 1;
            else return -1;
        } else {
            if (b.role == "customer") return -1;
            else return 1;
        }
    }
}