import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AngularFireAuth } from 'angularfire2/auth';

import { ProductService } from './services/productService';
import { AccountService } from './services/accountService';

import { Account } from './model/account';
import { Product } from './model/product';
import { PriceRecord } from './model/priceRecord';
import { SaleRecord } from './model/saleRecord';
import { BuyRecord } from './model/buyRecord';

import * as Papa from 'papaparse';

@Component({
    selector: 'products',
    templateUrl: './views/productsComponent.html',
    styleUrls: ['./views/app.component.css']
})

export class ProductsComponent implements OnInit {

    authUser: Observable<firebase.User>;
    user: firebase.User;
    account: Account = null;

    products: Observable<Product[]>;

    @Input() newProduct: Product = { id: null, category: null, name: null, price: null };
    selectedProduct: Product = null;
    time: string = "";

    priceRecords: Observable<PriceRecord[]>;
    priceRecordVisible: boolean = false;

    saleRecords: Observable<SaleRecord[]>;
    saleRecordVisible: boolean = false;
    saleRecordsCount: number = 0;
    saleRecordSum: number = 0;

    buyRecords: Observable<BuyRecord[]>;
    buyRecordVisible: boolean = false;
    buyMessageVisible: boolean = false;
    buyRecordsCount: number = 0;
    buyRecordSum: number = 0;

    private changeAmount: number = 5;

    constructor(private auth: AngularFireAuth,
        private accountService: AccountService,
        private productService: ProductService) {

        this.authUser = this.auth.authState;
        this.authUser.subscribe(user => {
            if (user) {
                this.user = user;
                this.accountService.getAccount(user.uid).subscribe(account => {
                    this.account = account;
                });
            } else {
                this.account = null;
                this.hideSaleRecords();
                this.hidePriceRecords();
                this.hideBuyRecords();
            }
        }, error => console.log("Get User Error", error));
    }

    ngOnInit(): void {
        this.getProducts();
    }

    getProducts(): void {
        this.products = this.productService.getProducts();
    }

    addProduct(): void {
        this.newProduct.price = this.newProduct.id * 10;
        this.productService.createProduct(this.newProduct, this.user)
            .then(() => this.newProduct = { id: null, category: null, name: null, price: null })
            .catch(error => console.log("Add Product Error", error));
    }

    importProductsByFile(event: any): void {
        var self = this;
        var fileReader: FileReader = new FileReader();
        var productsFile: File = event.target.files[0];
        fileReader.onload = function (e) {
            var products = JSON.parse(fileReader.result);
            self.productService.importProducts(products, self.user);
        };

        fileReader.readAsText(productsFile);
        event.target.value = "";
    }

    increasePrice(product: Product): void {
        this.updatePrice(product, this.changeAmount);
    }

    decreasePrice(product: Product): void {
        this.updatePrice(product, -this.changeAmount);
    }

    private updatePrice(product: Product, changeAmount: number): void {
        this.productService.updateProductPrice(product, this.user, changeAmount)
            .then(() => {
                product.price += changeAmount;
                this.showPriceRecords(product)
            })
            .catch(error => console.log("Update Product Error", error));
    }

    removeProduct(product: Product): void {
        this.productService.deleteProduct(product, this.user)
            .then(() => console.log("success"))
            .catch(error => console.log("Remove Product Error", error));
    }

    buy(product: Product): void {
        if (this.account.balance < product.price) return;

        this.productService.buyProduct(product, this.user).then(() => {
            this.showBuyRecords();
            this.buyMessageVisible = true;
            this.productService.getTime(product, this.user).then(result => {
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
        this.selectedProduct = product;
    }

    showPriceRecords(product: Product): void {
        this.hideSaleRecords();
        this.priceRecordVisible = true;
        this.selectedProduct = product;
        this.priceRecords = this.productService.getPriceRecords(product);

        this.productService.getProduct(this.selectedProduct).subscribe(product => {
            if (!product)
                this.hidePriceRecords();
        });
    }

    showSaleRecords(product: Product): void {
        this.hidePriceRecords();
        this.saleRecordVisible = true;
        this.selectedProduct = product;

        this.saleRecords = this.productService.getSaleRecords(product).map(records => {
            this.saleRecordSum = 0;
            this.saleRecordsCount = records.length;
            records.forEach(record => this.saleRecordSum += record.productPrice);
            return records.slice(0, 10);
        });

        this.productService.getProduct(this.selectedProduct).subscribe(product => {
            if (!product)
                this.hideSaleRecords();
        });
    }

    showBuyRecords(): void {
        this.buyRecordVisible = true;
        this.buyRecords = this.accountService.getBuyRecords(this.account).map(records => {
            this.buyRecordSum = 0;
            this.buyRecordsCount = records.length;
            records.forEach(record => this.buyRecordSum += record.productPrice);
            return records.slice(0, 10);
        });
    }

    hidePriceRecords(): void {
        this.selectedProduct = null;
        this.priceRecords = null;
        this.priceRecordVisible = false;
    }

    hideSaleRecords(): void {
        this.selectedProduct = null;
        this.saleRecords = null;
        this.saleRecordVisible = false;
    }

    hideBuyRecords(): void {
        this.buyRecords = null;
        this.buyRecordVisible = false;
    }
}