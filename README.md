# Snok Enterprise – Online Store

An online store for solar and inverter technology: solar panels, inverters, batteries, charge controllers, complete solar kits, solar lights, and cables and accessories, at **retail and wholesale prices**.

It's a static website with no server, database or paid service. It can be hosted for free on GitHub Pages.

## Features

- **Shop**: browse by category, search, sort by price or name, and show only in-stock items
- **Retail & wholesale pricing**: each product has a wholesale price that applies automatically once the customer reaches the minimum quantity. The cart shows the savings and how many more units are needed to get the wholesale price
- **Cart**: change quantities and remove items. The cart is saved in the customer's browser
- **Checkout**: delivery (all 36 states + FCT) or shop pickup; bank transfer or pay on delivery
- **Orders sent to you on WhatsApp or by email**: the customer sends a neatly formatted order with an order number (e.g. `SNK-261030-4955`). Bank details are shown for transfers
- **My Orders**: customers can see and resend their past orders
- **Solar Calculator**: customers enter their appliances and get a recommended inverter, matching batteries and solar panels, with an "Add all to cart" button
- **About & FAQ**, **Contact** form (via WhatsApp or email), and a floating WhatsApp chat button
- Works on phones, tablets and computers

## Setting up your store

### 1. Your business details – `config.js`
Replace the example values with your real WhatsApp number, phone, email, address, opening hours and bank details. The yellow reminder bar at the top of the site disappears once the WhatsApp number and email are changed.

WhatsApp number format: country code + number, digits only. For example `0803 123 4567` becomes `2348031234567`.

### 2. Your products and prices – `products.js`
**The prices included are samples. Replace them with your real prices.**

To add a product, copy an existing `{ ... },` block, paste it below, and change the values. Each field is explained at the top of the file. To add a product photo, upload the image to the repository (e.g. into an `images` folder) and set `image: "images/your-photo.jpg"`.

You can edit these files directly on GitHub: open the file, click the ✏️ pencil icon, make your changes, then click **Commit changes**. The live site updates within a minute or two.

### 3. After changing files
To make sure customers' browsers load your latest version, open `index.html` and increase the `?v=1` numbers (e.g. to `?v=2`).

## Putting it online (free)
In the repository on GitHub: **Settings → Pages → Branch: main → / (root) → Save**. The site will be live at `https://<your-username>.github.io/<repository-name>/`.

## Files

| File | What it does |
|---|---|
| `index.html` | Page layout: header, footer, and where each page is shown |
| `style.css` | Colours, fonts and layout |
| `app.js` | How the store works: pages, cart, checkout, calculator |
| `config.js` | Your business details |
| `products.js` | Your categories and products |
