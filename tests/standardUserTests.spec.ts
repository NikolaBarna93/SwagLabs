import { test, expect, } from '@playwright/test';
import { PageManager } from '../page-objects/pageManager';

/* Logging in before each test */
test.beforeEach (async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.locator('input[name="user-name"]').fill('standard_user');
  await page.locator('input[name="password"]').fill('secret_sauce');
  await page.locator('input[name="login-button"]').click();
  await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
})

/* E2E tests for buying items */
test.describe('E2E tests for buying items', () => {

  /* Success story of buying single item */
  test('Buy one random item', async ({ page }) => {
    const pm= new PageManager(page);
    const items = await pm.inventory().getAllItems();
    const numberOfItems = await items.count();
    for (let i=0; i<numberOfItems; i++){
      const randomIndex = Math.floor(Math.random() * numberOfItems);
      const itemName = await items.nth(randomIndex).locator('.inventory_item_name').textContent();
      if (itemName){
        await pm.inventory().addToCart(itemName);
        await pm.navigateTo().cartPage();
        const cartItem = page.locator('.cart_item');
        await expect(cartItem).toHaveCount(1);
        const cartItemName = await cartItem.locator('.inventory_item_name').textContent();
        expect(cartItemName).toBe(itemName);
        await page.locator('#checkout').click();
        await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');
        await pm.checkOut().checkoutInformation('John', 'Doe', '12345');
        await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');
        await page.locator('#finish').click();
        await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');
        await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
        break;
      }
    }
  });

  /* Success story of buying multiple items */
  test('Buy multiple items (random)', async ({ page }) => {
    const pm= new PageManager(page);
    const items = await pm.inventory().getAllItems();
    const numberOfItems = await items.count();
    const itemsToBuy = Math.floor(Math.random() * numberOfItems) + 1; // Buy at least one item
    const selectedIndices = new Set<number>();
    while (selectedIndices.size < itemsToBuy){
      const randomIndex = Math.floor(Math.random() * numberOfItems);
      selectedIndices.add(randomIndex);
    }
    for (const index of selectedIndices){
      const itemName = await items.nth(index).locator('.inventory_item_name').textContent();
      if (itemName){
        await pm.inventory().addToCart(itemName);
      }
    }
    await pm.navigateTo().cartPage();
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(itemsToBuy);
    await page.locator('#checkout').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');
    await pm.checkOut().checkoutInformation('Jane', 'Smith', '54321');
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');
    await page.locator('#finish').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
  });

  /* Success story of buying all items */
  test('Buy all items', async ({ page }) => {
    const pm= new PageManager(page);
    const items = await pm.inventory().getAllItems();
    const numberOfItems = await items.count();
    for (let i=0; i<numberOfItems; i++){
      const itemName = await items.nth(i).locator('.inventory_item_name').textContent();
      if (itemName){
        await pm.inventory().addToCart(itemName);
      }
    }
    await pm.navigateTo().cartPage();
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(numberOfItems);
    await page.locator('#checkout').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');
    await pm.checkOut().checkoutInformation('Alice', 'Johnson', '67890');
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');
    await page.locator('#finish').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
  });
});

/* Tests for invalid checkout information */
test.describe('invalid checkout information', () => {
  /* Test with missing first name */
  test('Missing first name', async ({ page }) => {
    const pm= new PageManager(page);
    await pm.inventory().addToCartItems(1);
    await pm.navigateTo().cartPage();
    await page.locator('#checkout').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');
    await pm.checkOut().checkoutInformation('', 'Doe', '12345');
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toHaveText('Error: First Name is required');
  });

  /* Test with missing last name */
  test('Missing last name', async ({ page }) => {
    const pm= new PageManager(page);
    await pm.inventory().addToCartItems(1);
    await pm.navigateTo().cartPage();
    await page.locator('#checkout').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');
    await pm.checkOut().checkoutInformation('John', '', '12345');
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toHaveText('Error: Last Name is required');
  });

  /* Test with missing postal code */
  test('Missing postal code', async ({ page }) => {
    const pm= new PageManager(page);
    await pm.inventory().addToCartItems(1);
    await pm.navigateTo().cartPage();
    await page.locator('#checkout').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');
    await pm.checkOut().checkoutInformation('John', 'Doe', '');
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toHaveText('Error: Postal Code is required');
  });

  /* Test with all fields missing */
  test('All fields missing', async ({ page }) => {
    const pm= new PageManager(page);
    await pm.inventory().addToCartItems(1);
    await pm.navigateTo().cartPage();
    await page.locator('#checkout').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');
    await pm.checkOut().checkoutInformation('', '', '');
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toHaveText('Error: First Name is required');
  });
});

/** Testing each possible ordering of items */
test.describe('Inventory item ordering', () => {
  /* Test ordering items A to Z */
  test('Order items A to Z', async ({ page }) => {
    const pm= new PageManager(page);
    await pm.inventory().orderItemsBy('az');
    const items = await pm.inventory().getAllItems();
    const itemNames = [];
    const itemCount = await items.count();
    for (let i=0; i<itemCount; i++){
      const name = await items.nth(i).locator('.inventory_item_name').textContent();
      if (name) itemNames.push(name);
    }
    const sortedNames = [...itemNames].sort((a, b) => a.localeCompare(b));
    expect(itemNames).toEqual(sortedNames);
  });

  /* Test ordering items Z to A */
  test('Order items Z to A', async ({ page }) => {
    const pm= new PageManager(page);
    await pm.inventory().orderItemsBy('za');
    const items = await pm.inventory().getAllItems();
    const itemNames = [];
    const itemCount = await items.count();
    for (let i=0; i<itemCount; i++){
      const name = await items.nth(i).locator('.inventory_item_name').textContent();
      if (name) itemNames.push(name);
    }
    const sortedNames = [...itemNames].sort((a, b) => b.localeCompare(a));
    expect(itemNames).toEqual(sortedNames);
  });

  /* Test ordering items by price low to high */
  test('Order items by price low to high', async ({ page }) => {
    const pm= new PageManager(page);
    await pm.inventory().orderItemsBy('lohi');
    const items = await pm.inventory().getAllItems();
    const itemPrices = [];
    const itemCount = await items.count();
    for (let i=0; i<itemCount; i++){
      const priceText = await items.nth(i).locator('.inventory_item_price').textContent();
      if (priceText){
        const price = parseFloat(priceText.replace('$', ''));
        itemPrices.push(price);
      }
    }
    const sortedPrices = [...itemPrices].sort((a, b) => a - b);
    expect(itemPrices).toEqual(sortedPrices);
  });

  /* Test ordering items by price high to low */
  test('Order items by price high to low', async ({ page }) => {
    const pm= new PageManager(page);
    await pm.inventory().orderItemsBy('hilo');
    const items = await pm.inventory().getAllItems();
    const itemPrices = [];
    const itemCount = await items.count();
    for (let i=0; i<itemCount; i++){
      const priceText = await items.nth(i).locator('.inventory_item_price').textContent();
      if (priceText){
        const price = parseFloat(priceText.replace('$', ''));
        itemPrices.push(price);
      }
    }
    const sortedPrices = [...itemPrices].sort((a, b) => b - a);
    expect(itemPrices).toEqual(sortedPrices);
  });
});

/** Checking functionality of reset app state */
test.describe('Reset app state', () => {
  /** Confirming cart badge is removed after app reset */
  test('Reset cart item count', async ({ page }) => {
    const pm= new PageManager(page);
    await pm.inventory().addToCartItems(2);
    const cartBadge = await page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('2');
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('#reset_sidebar_link').click();
    await expect(cartBadge).not.toBeAttached();
  });
  /** Confirming remove button is replaced with add to cart after app reset */
  test('Reset inventory buttons', async ({ page }) => {
    const pm= new PageManager(page);
    await pm.inventory().addToCartItems(2);
    let inventoryButtons = page.locator('.btn_secondary');
    let buttonCount = await inventoryButtons.count();
    await expect(buttonCount).toBe(2); // Assuming there are 6 items total, 2 added to cart
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('#reset_sidebar_link').click();
    inventoryButtons = page.locator('.btn_secondary');
    buttonCount = await inventoryButtons.count();
    await expect(buttonCount).toBe(0);
  })
  /**Confirming cart page has no items after app reset */
  test('Reset from cart page', async ({ page }) => {
    const pm= new PageManager(page);
    await pm.inventory().addToCartItems(1);
    await pm.navigateTo().cartPage();
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(1);
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('#reset_sidebar_link').click();
    await expect(cartItems).toHaveCount(0);
  });
});

/** Removing items from cart */
test.describe('Remove from cart', () => {
  /** Remove one item from the cart with one item */
  test('Remove single item from cart', async ({ page }) => {
    const pm= new PageManager(page);
    await pm.inventory().addToCartItems(1);
    await pm.navigateTo().cartPage();
    let cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(1);
    await cartItems.nth(0).locator('button').click();
    cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(0);
  });
  /** Remove items from the cart trough main page */
  test('Remove multiple items from main page', async ({ page }) => {
    const pm= new PageManager(page);
    await pm.inventory().addToCartItems(3);
    let inventoryButtons = page.locator('.btn_secondary');
    let buttonCount = await inventoryButtons.count();
    await expect(buttonCount).toBe(3); // Assuming there are 6 items total, 3 added to cart
    for (let i=0; i<3; i++){
      await inventoryButtons.nth(0).click(); // Always remove the first button in the list
    }
    inventoryButtons = page.locator('.btn_secondary');
    buttonCount = await inventoryButtons.count();
    await expect(buttonCount).toBe(0);
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).not.toBeAttached();
    await pm.navigateTo().cartPage();
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(0);
  })
  /** Remove one item from cart with multiple items */
  test('Remove one item from cart with multiple items', async ({ page }) => {
    const pm= new PageManager(page);
    await pm.inventory().addToCartItems(4);
    await pm.navigateTo().cartPage();
    let cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(4);
    await cartItems.nth(1).locator('button').click(); // Remove second item
    cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(3);
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('3');
  });
});