# Playwright Selector Guide

Quick reference for stable, reliable selectors.

## Priority Order (Most Stable → Least Stable)

### 1. Role-Based (BEST)

```javascript
page.getByRole('button', { name: 'Add to cart' })
page.getByRole('heading', { level: 1 })
page.getByRole('link', { name: 'Next page' })
page.getByRole('textbox', { name: 'Email' })
```

### 2. Test IDs

```javascript
page.getByTestId('product-price')
page.getByTestId('add-to-cart-button')
```

### 3. Labels (Forms)

```javascript
page.getByLabel('Email')
page.getByLabel('Password')
```

### 4. Text Content

```javascript
page.getByText('Sign in')
page.getByText('Add to cart')
```

### 5. CSS/XPath (LAST RESORT)

```javascript
page.locator('.product-price')
page.locator('xpath=//div[@class="content"]')
```

## Common Roles

```javascript
button, link, textbox, checkbox, radio, combobox, 
listbox, menu, menuitem, tab, tabpanel, dialog,
heading, img, list, listitem, table, row, cell
```

## Chaining Selectors

```javascript
// Find button within a specific section
page.locator('.checkout-section').getByRole('button', { name: 'Pay' })

// Find specific list item
page.getByRole('list').getByRole('listitem').filter({ hasText: 'Apple' })
```
