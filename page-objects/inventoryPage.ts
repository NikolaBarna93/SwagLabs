import { Page } from "@playwright/test";

export class InventoryPage{

    readonly page: Page
    constructor(page: Page){
        this.page = page;
    }
    /**
     * Adding an item to cart by item name
     * @param itemName Name of an item (e.g. "Sauce Labs Backpack")
     */
    async addToCart(itemName: string){
        const itemButton = 'add-to-cart-' + itemName.toLowerCase().replaceAll(' ', '-');
        console.log('Trying to click:', `#${itemButton}`);
        await this.page.locator(`[id="${itemButton}"]`).click();
    }
    /**
     * Adding a specific number of items to the cart (starting from the top of the list)
     * @param numberOfItems Number of items to add to the cart
     */
    async addToCartItems(numberOfItems: number){
        const items = this.page.locator('.inventory_item');
        const count = await items.count();
        for(let i = 0; i < Math.min(numberOfItems, count); i++){
            const item = items.nth(i);
            const button = item.locator('button');
            await button.click();
        }
    }
    /**
     * Getting all items on the inventory page
     */
    async getAllItems(){
        return this.page.locator('.inventory_item');
    }
    /**
     * Order items by a specific criteria
     * @param criteria Criteria to order items by. Options: "az" (A to Z), "za" (Z to A), "lohi" (Low to High), "hilo" (High to Low)
     */
    async orderItemsBy(criteria: string){
        let optionValue = '';
        switch(criteria){
            case 'az': optionValue = 'az'; break;
            case 'za': optionValue = 'za'; break;
            case 'lohi': optionValue = 'lohi'; break;
            case 'hilo': optionValue = 'hilo'; break;
            default: throw new Error('Invalid criteria. Use "az", "za", "lohi", or "hilo".');
        }
        await this.page.locator('.product_sort_container').selectOption(criteria);
    }
}