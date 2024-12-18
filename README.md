## Installation

Before getting started with `whatsapp-web.js`, it's essential for you to install [Node.js](https://wwebjs.dev/guide/installation.html#installing-node-js) and [whatsapp-web.js](https://wwebjs.dev/guide/installation.html#installing-node-js) itself on your machine. Please note that whatsapp-web.js v1 requires Node v18 or higher.

> TIP
> To check if you already have Node installed on your machine, run `node -v` in your terminal. If the output is `v18` or higher, then you're good to go! Otherwise you should continue reading.
>
> > WARNING
> > If you already have Node installed, but you are using an older version that is below v18, you need to upgrade your Node version too. You can do this by installing the [nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

## Installing Node.js

1. Download any [version above 18+](https://nodejs.org/) from the official Node.js website.
2. After the download is complete, open the downloaded file and follow the installer steps.
3. Once the installation is complete, you can use Node.js and npm in your terminal.

## Installation on no-gui systems

If you want to install `whatsapp-web.js` on a system without a GUI, such as a `linux server image`, and you need `puppeteer` to emulate the Chromium browser, there are a few additional steps you'll need to take.

First, you'll need to install dependencies required by `puppeteer`, such as the necessary libraries and tools for running a headless Chromium browser.

```
sudo apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

## Initialize the project

```
npm install
```

## Run the project

```
npm run start
```
