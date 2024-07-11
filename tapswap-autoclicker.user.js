// ==UserScript==
// @name         TapSwap Autoclicker
// @namespace    Violentmonkey Scripts
// @match        *://*.tapswap.club/*
// @author       Homous
// @version      1.1
// @description  12.06.2024, 17:09:30
// @grant        none
// @icon         http://89.106.206.41/homous/TAPSWAPICON.png
// @downloadURL  https://github.com/S3C237/TapSwap/raw/main/tapswap-autoclicker.user.js
// @updateURL    https://github.com/S3C237/TapSwap/raw/main/tapswap-autoclicker.user.js
// @homepage     https://github.com/S3C237/TapSwap
// ==/UserScript==

// Custom values
const minClickDelay = 30; // Minimum delay between clicks in milliseconds
const maxClickDelay = 50; // Maximum delay between clicks in milliseconds
const pauseMinTime = 100000; // Minimum pause in milliseconds (100 seconds)
const pauseMaxTime = 300000; // Maximum pause in milliseconds (300 seconds)
const energyThreshold = 25; // Energy threshold below which a pause is made
const checkInterval = 1500; // Coin presence check interval in milliseconds (3 seconds)
const maxCheckAttempts = 3; // Maximum number of attempts to check for coin availability

let checkAttempts = 0; // Verification attempt counter

// Configuring styles for logs
const styles = {
    success: 'background: #28a745; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
    starting: 'background: #8640ff; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
    error: 'background: #dc3545; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
    info: 'background: #007bff; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
};
const logPrefix = '%c[TapSwapBot] ';

// Rewriting console.log function to add prefix and styles
const originalLog = console.log;
console.log = function () {
    if (typeof arguments[0] === 'string' && arguments[0].includes('[TapSwapBot]')) {
        originalLog.apply(console, arguments);
    }
};

// Disabling other console methods for clear output
console.error = console.warn = console.info = console.debug = () => { };

// Clearing the console and startup messages
console.clear();
console.log(`${logPrefix}Starting`, styles.starting);
console.log(`${logPrefix}Created by https://t.me/mudachyo`, styles.starting);
console.log(`${logPrefix}Github https://github.com/mudachyo/TapSwap`, styles.starting);

function triggerEvent(element, eventType, properties) {
    const event = new MouseEvent(eventType, properties);
    element.dispatchEvent(event);
}

function getRandomCoordinateInCircle(radius) {
    let x, y;
    do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
    } while (x * x + y * y > 1); // Checking that the point is inside the circle
    return {
        x: Math.round(x * radius),
        y: Math.round(y * radius)
    };
}

function getCurrentEnergy() {
    const energyElement = document.querySelector("div._value_tzq8x_13 h4._h4_1w1my_1");
    if (energyElement) {
        return parseInt(energyElement.textContent);
    }
    return null;
}

function checkCoinAndClick() {
    const button = document.querySelector("#ex1-layer img");

    if (button) {
        console.log(`${logPrefix}Coin found. The click is executed.`, styles.success);
        clickButton();
    } else {
        checkAttempts++;
        if (checkAttempts >= maxCheckAttempts) {
            console.log(`${logPrefix}Coin not found after 3 attempts. Reloading the page.`, styles.error);
            location.reload();
        } else {
            console.log(`${logPrefix}Coin not found. Attempt  ${checkAttempts}/${maxCheckAttempts}. Check again after 3 seconds.`, styles.error);
            setTimeout(checkCoinAndClick, checkInterval);
        }
    }
}

function clickButton() {
    const currentEnergy = getCurrentEnergy();
    if (currentEnergy !== null && currentEnergy < energyThreshold) {
        const pauseTime = pauseMinTime + Math.random() * (pauseMaxTime - pauseMinTime);
        console.log(`${logPrefix}The energy is lower ${energyThreshold}. Pause for ${Math.round(pauseTime / 1000)} seconds.`, styles.info);
        setTimeout(clickButton, pauseTime);
        return;
    }

    const button = document.querySelector("#ex1-layer img");

    if (button) {
        const rect = button.getBoundingClientRect();
        const radius = Math.min(rect.width, rect.height) / 2;
        const { x, y } = getRandomCoordinateInCircle(radius);

        const clientX = rect.left + radius + x;
        const clientY = rect.top + radius + y;

        const commonProperties = {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: clientX,
            clientY: clientY,
            screenX: clientX,
            screenY: clientY,
            pageX: clientX,
            pageY: clientY,
            pointerId: 1,
            pointerType: "touch",
            isPrimary: true,
            width: 1,
            height: 1,
            pressure: 0.5,
            button: 0,
            buttons: 1
        };

        // Trigger events
        triggerEvent(button, 'pointerdown', commonProperties);
        triggerEvent(button, 'mousedown', commonProperties);
        triggerEvent(button, 'pointerup', { ...commonProperties, pressure: 0 });
        triggerEvent(button, 'mouseup', commonProperties);
        triggerEvent(button, 'click', commonProperties);

        // Schedule the next click with a random delay
        const delay = minClickDelay + Math.random() * (maxClickDelay - minClickDelay);
        setTimeout(checkCoinAndClick, delay);
    } else {
        console.log(`${logPrefix}Coin not found!`, styles.error);
    }
}

// Start the first check
checkCoinAndClick();
