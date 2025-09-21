import { Page } from "@playwright/test";

export class CheckOut{
    readonly page: Page
    constructor(page: Page){
        this.page = page;
    }
    /**
     * Fills out the checkout information form and continues to the next step
     * @param firstName 
     * @param lastName 
     * @param postalCode 
     */
    async checkoutInformation(firstName: string, lastName: string, postalCode: string){
        await this.page.locator('#first-name').fill(firstName);
        await this.page.locator('#last-name').fill(lastName);
        await this.page.locator('#postal-code').fill(postalCode);
        await this.page.locator('#continue').click();
    }
}