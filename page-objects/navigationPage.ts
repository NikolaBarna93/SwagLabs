import { Page } from "@playwright/test";

/**
 * NavigationPage class to handle navigation between different pages
 */
export class NavigationPage{

    readonly page: Page;
    constructor(page: Page){
        this.page = page;
        
    }
    /**
     * Navigate to Cart Page
     */
    async cartPage(){
        await this.page.locator('.shopping_cart_link').click();
        await this.page.waitForURL('https://www.saucedemo.com/cart.html');
    }
    /**
     * Navigate to Home Page (Inventory Page)
     */
    async homePage(){
        await this.page.locator('#react-burger-menu-btn').click();
        await this.page.locator('#inventory_sidebar_link').click();
        await this.page.waitForURL('https://www.saucedemo.com/inventory.html');
    }
    /**
     * Navigate to specific item page by clicking on the item name
     * @param itemName Name of an item (e.g. "Sauce Labs Backpack")
     */
    async specificItemPage(itemName: string){
        await this.page.locator(`text=${itemName}`).click();
        await this.page.waitForURL(/.*inventory-item.html.*/);
    }
}