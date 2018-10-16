import { Injectable, Inject } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase';

import { Account } from '../model/account';
import { BuyRecord } from '../model/buyRecord';
import { BalanceRecord } from '../model/balanceRecord';

import { Headers, Http } from '@angular/http';

@Injectable()
export class AccountService {

    private accountCollection: AngularFirestoreCollection<Account>;

    constructor(private database: AngularFirestore, private http: Http) {
        this.accountCollection = database.collection<Account>("accounts", ref => ref.orderBy("firebaseId"));
    }

    getAccounts(): Observable<Account[]> {
        return this.accountCollection.snapshotChanges().map(actions => {
            return actions.map(account => {
                const data = account.payload.doc.data() as Account;
                const $key = account.payload.doc.id;
                return { $key, ...data };
            });
        });
    }

    getAccount(firebaseId: string): Observable<any> {
        return this.accountCollection.doc(firebaseId).valueChanges();
    }

    importAccounts(accounts: Account[], user: firebase.User): Promise<any> {
        return user.getIdToken().then(token => {
            var url = "https://us-central1-paas-01-taipeitech.cloudfunctions.net/accountWS-importAccounts";
            var headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            });

            return this.http.post(url, accounts, { headers }).toPromise();
        })
    }

    createAccount(user: firebase.User): Promise<any> {
        return user.getIdToken().then(token => {
            var url = "https://us-central1-paas-01-taipeitech.cloudfunctions.net/accountWS-createAccount";
            var headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            });

            return this.http.post(url, {}, { headers }).toPromise();
        })
    }

    updateAccount(account: Account, user: firebase.User): Promise<any> {
        return user.getIdToken().then(token => {
            var url = "https://us-central1-paas-01-taipeitech.cloudfunctions.net/accountWS-updateAccount";
            var headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            });

            return this.http.put(url, account, { headers }).toPromise();
        })
    }

    updateBalance(amount: number, user: firebase.User): Promise<any> {
        return user.getIdToken().then(token => {
            var url = "https://us-central1-paas-01-taipeitech.cloudfunctions.net/accountWS-increaseBalance";
            var headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            });

            return this.http.put(url, { amount }, { headers }).toPromise();
        })
    }

    getTime(user: firebase.User): Promise<any> {
        return user.getIdToken().then(token => {
            var url = "https://us-central1-paas-01-taipeitech.cloudfunctions.net/saleWS-saleTimeToLastBuy";
            var headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            });

            return this.http.post(url, { name: "加值" }, { headers }).toPromise();
        });
    }

    deleteAccount(account: Account, user: firebase.User): Promise<any> {
        return user.getIdToken().then(token => {
            var url = "https://us-central1-paas-01-taipeitech.cloudfunctions.net/accountWS-deleteAccount?firebaseId=" + account.firebaseId;
            var headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            });

            return this.http.delete(url, { headers }).toPromise();
        })
    }

    getBuyRecords(account: Account): Observable<BuyRecord[]> {
        var saleRecordCollection = this.accountCollection.doc(account.firebaseId).collection<BuyRecord>("buyRecords", ref => ref.orderBy("timeStamp", "desc"));
        return saleRecordCollection.snapshotChanges().map(actions => {
            return actions.map(item => {
                const data = item.payload.doc.data() as BuyRecord;
                const $key = item.payload.doc.id;
                return { $key, ...data };
            });
        });
    }

    getBalanceRecords(account: Account): Observable<BalanceRecord[]> {
        var balanceRecordCollection = this.accountCollection.doc(account.firebaseId).collection<BalanceRecord>("balanceRecords", ref => ref.orderBy("timeStamp", "desc"));
        return balanceRecordCollection.snapshotChanges().map(actions => {
            return actions.map(item => {
                const data = item.payload.doc.data() as BalanceRecord;
                const $key = item.payload.doc.id;
                return { $key, ...data };
            });
        });
    }
}