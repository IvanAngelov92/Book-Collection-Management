const { test, describe, beforeEach, afterEach, beforeAll, afterAll, expect } = require('@playwright/test');
const { chromium } = require('playwright');

const host = 'http://localhost:3000';

let browser;
let context;
let page;

let user = {
    email : "",
    password : "123456",
    confirmPass : "123456",
};

let bookTitle = "";

describe("e2e tests", () => {
    beforeAll(async () => {
        browser = await chromium.launch();
    });

    afterAll(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        context = await browser.newContext();
        page = await context.newPage();
    });

    afterEach(async () => {
        await page.close();
        await context.close();
    });

    
    describe("authentication", () => {
        test("Register with Valid Data", async () => {
            await page.goto(host);
            await page.click('text=Register');

            await page.waitForSelector('form');

            let random = Math.floor(Math.random() * 1000);
            user.email = `abv_${random}@abv.bg`;

            await page.locator("//input[@name='email']").fill(user.email);
            await page.locator("//input[@name='password']").fill(user.password);
            await page.locator("//input[@name='conf-pass']").fill(user.confirmPass);
            await page.click("//button[text()='Register']");

            await expect(page.locator('nav >> text=Logout')).toBeVisible();
            expect(page.url()).toBe(host + '/');
        });

        test("Login with Valid Data", async () => {
            await page.goto(host);
            await page.click("//a[@href='/login']");
            await page.waitForSelector("//form");

            await page.fill("//input[@name='email']", user.email);
            await page.fill("//input[@name='password']", user.password);
            await page.click("//button[text()='Login']");

            await expect(page.locator("//a[text()='Logout']")).toBeVisible();
            expect(page.url()).toBe(host + "/");
        });

        test("logout from the application", async () => {
            await page.goto(host);
            await page.click("//a[@href='/login']");
            await page.waitForSelector("//form");

            await page.fill("//input[@name='email']", user.email);
            await page.fill("//input[@name='password']", user.password);
            await page.click("//button[text()='Login']");

            await page.click("//a[text()='Logout']");

            await expect(page.locator("//a[text()='Login']")).toBeVisible();
            expect(page.url()).toBe(host + "/");
        });
    });

    describe("navbar", () => {
        test("Navigation for Logged-In User", async () => {
            await page.goto(host);
            await page.click("//a[@href='/login']");
            await page.waitForSelector("//form");

            await page.fill("//input[@name='email']", user.email);
            await page.fill("//input[@name='password']", user.password);
            await page.click("//button[text()='Login']");

            await expect(page.locator("//a[text()='Home']")).toBeVisible();
            await expect(page.locator("//a[text()='Collection']")).toBeVisible();
            await expect(page.locator("//a[text()='Search']")).toBeVisible();
            await expect(page.locator("//a[text()='Create Book']")).toBeVisible();
            await expect(page.locator("//a[text()='Logout']")).toBeVisible();

            await expect(page.locator("//a[text()='Login']")).toBeHidden();
            await expect(page.locator("//a[text()='Register']")).toBeHidden();
        });

        test("Navigation for Guest User", async () => {
            await page.goto(host);

            await expect(page.locator("//a[text()='Home']")).toBeVisible();
            await expect(page.locator("//a[text()='Collection']")).toBeVisible();
            await expect(page.locator("//a[text()='Search']")).toBeVisible();
            await expect(page.locator("//a[text()='Login']")).toBeVisible();
            await expect(page.locator("//a[text()='Register']")).toBeVisible();

            await expect(page.locator("//a[text()='Create Book']")).toBeHidden();
            await expect(page.locator("//a[text()='Logout']")).toBeHidden();
        });
    });

    describe("CRUD", () => {
        beforeEach(async () => {
            await page.goto(host);
            await page.click("//a[@href='/login']");
            await page.waitForSelector("//form");

            await page.fill("//input[@name='email']", user.email);
            await page.fill("//input[@name='password']", user.password);
            await page.click("//button[text()='Login']");
        });

        test("Create a Book", async () => {
            await page.click("//a[text()='Create Book']");
            await page.waitForSelector("//form");

            let random = Math.floor(Math.random() * 10000);
            bookTitle = `BookTitle_${random}`;

            await page.locator("//input[@name='title']").fill(bookTitle);
            await page.locator("//input[@name='coverImage']").fill("/images/1984.jpg");
            await page.locator("//input[@name='year']").fill("1992");
            await page.locator("//input[@name='author']").fill("SomeAuthor");
            await page.locator("//input[@name='genre']").fill("Genre");
            await page.locator("//textarea[@name='description']").fill("SomeDescription");

            await page.click("//button[text()='Save']");

            await expect(page.locator('div.book', { hasText: bookTitle})).toHaveCount(1);
            expect(page.url()).toBe(host + "/collection");
        });

        test("Edit a Book", async () => {
            await page.click("//a[text()='Search']");
            await page.fill("//input[@name='search']", bookTitle);
            await page.click("//button[text()='Search']");
            bookTitle = "Edited_" + bookTitle;
        });

        test("Delete a Book", async () => {
            await page.click("//a[text()='Search']");
            await page.fill("//input[@name='search']", bookTitle);
            await page.click("//button[text()='Search']");
        });
    });
});