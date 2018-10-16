import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { LoginComponent } from './loginComponent';
import { ProductsComponent } from './productsComponent';
import { QrcodeComponent } from './qrcodeComponent';
import { AccountsComponent } from './accountsComponent';

const routes: Routes = [
    { path: '', redirectTo: '/products', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'products', component: ProductsComponent },
    { path: 'qrcode', component: QrcodeComponent },
    { path: 'accounts', component: AccountsComponent }    
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }