import { Injectable, Inject } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';

import * as firebase from 'firebase';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { Product } from '../model/product';
import { PriceRecord } from '../model/priceRecord';
import { SaleRecord } from '../model/saleRecord';

import { Headers, Http } from '@angular/http';

@Injectable()
export class ProductService {

    private productCollection: AngularFirestoreCollection<Product>;

    constructor(private database: AngularFirestore, private http: Http) {
        this.productCollection = database.collection("products", ref => ref.orderBy("id"));
    }

    getProducts(): Observable<Product[]> {
        return this.productCollection.snapshotChanges().map(actions => {
            return actions.map(item => {
                const data = item.payload.doc.data() as Product;
                const $key = item.payload.doc.id;
                return { $key, ...data };
            });
        });
    }

    getProduct(product: Product): Observable<any> {
        return this.productCollection.doc(product["$key"]).valueChanges();
    }

    importProducts(products: Product[], user: firebase.User): Promise<any> {
        return user.getIdToken().then(token => {
            var url = "https://us-central1-paas-01-taipeitech.cloudfunctions.net/productWS-importProducts";
            var headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            });

            return this.http.post(url, products, {headers}).toPromise();
        });
    }

    createProduct(product: Product, user: firebase.User): Promise<any> {
        return user.getIdToken().then(token => {
            var url = "https://us-central1-paas-01-taipeitech.cloudfunctions.net/productWS-createProduct";
            var headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            });

            return this.http.post(url, product, {headers}).toPromise();
        });
    }

    updateProductPrice(product: Product, user: firebase.User, changeAmount: number): Promise<any> {
        return user.getIdToken().then(token => {
            var url = "https://us-central1-paas-01-taipeitech.cloudfunctions.net/productWS-updateProductPrice";
            var headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            });

            console.log({product, changeAmount})
            return this.http.put(url, {product, changeAmount}, {headers}).toPromise();
        });
    }

    deleteProduct(product: Product, user: firebase.User): Promise<any> {
        return user.getIdToken().then(token => {
            var url = "https://us-central1-paas-01-taipeitech.cloudfunctions.net/productWS-deleteProduct?productId=" + product["$key"];
            var headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            });

            return this.http.delete(url, {headers}).toPromise();
        })
    }

    buyProduct(product: Product, user: firebase.User): Promise<any> {
        return user.getIdToken().then(token => {
            var url = "https://us-central1-paas-01-taipeitech.cloudfunctions.net/productWS-buyProduct";
            var headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            });

            console.log(product)
            return this.http.post(url, product, {headers}).toPromise();
        });
    }

    getTime(product: Product, user: firebase.User): Promise<any> {
        return user.getIdToken().then(token => {
            var url = "https://us-central1-paas-01-taipeitech.cloudfunctions.net/saleWS-saleTimeToLastBuy";
            var headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            });

            console.log(product)
            return this.http.post(url, {name: product.name}, {headers}).toPromise();
        });
    }

    getPriceRecords(product: Product): Observable<PriceRecord[]> {
        var recordCollection = this.productCollection.doc(product["$key"]).collection<PriceRecord>("priceRecords", ref => ref.orderBy("timeStamp", "desc").limit(10));
        return recordCollection.snapshotChanges().map(actions => {
            return actions.map(item => {
                const data = item.payload.doc.data() as PriceRecord;
                const $key = item.payload.doc.id;
                return { $key, ...data };
            });
        });
    }

    getSaleRecords(product: Product): Observable<SaleRecord[]> {
        var saleRecordCollection = this.productCollection.doc(product["$key"]).collection<SaleRecord>("saleRecords", ref => ref.orderBy("timeStamp", "desc"));
        return saleRecordCollection.snapshotChanges().map(actions => {
            return actions.map(item => {
                const data = item.payload.doc.data() as SaleRecord;
                const $key = item.payload.doc.id;
                return { $key, ...data };
            });
        });
    }

    updateProductsPrice(user: firebase.User, changeAmount: number): Promise<any> {
        return user.getIdToken().then(token => {
            var url = "https://us-central1-paas-01-taipeitech.cloudfunctions.net/saleWS-updateProductsPrice";
            var headers = new Headers({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            });

            return this.http.put(url, {"changeAmount": changeAmount}, {headers}).toPromise();
        });
    }
}