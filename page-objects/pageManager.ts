import { Page } from "@playwright/test";
import { InventoryPage } from "./inventoryPage";
import { NavigationPage } from "./navigationPage";
import { CheckOut } from "./checkOut";

/**
 * PageManager class to manage different page objects
 */
export class PageManager{
    readonly page: Page
    readonly inventoryPage: InventoryPage;
    readonly navigationPage: NavigationPage;
    readonly checkOutPage: CheckOut;

    constructor(page: Page){
        this.page = page;
        this.inventoryPage = new InventoryPage(this.page);
        this.navigationPage = new NavigationPage(this.page);
        this.checkOutPage = new CheckOut(this.page);
    }
    navigateTo(){
        return this.navigationPage
    }
    inventory(){
        return this.inventoryPage
    }
    checkOut(){
        return this.checkOutPage
    }
}