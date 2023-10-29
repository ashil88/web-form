const { test, expect } = require('@playwright/test');

test.describe('Web form test', () => {
    let page;

    test.describe('Given the visitor navigates to form page', () => {
        test.beforeAll(async({ browser }) => {
            page = await browser.newPage();
            await page.goto('http://localhost:3000')
        });
    
        test.describe('When the visitor submits the form', () => {
            test.beforeAll(async() => {
               await page.locator('.m-form__submit').click();
            });
    
            test('Then required field errors should be visible', async() => {
                await expect(page.locator('.m-form-row__error-message--visible')).toHaveCount(4);
            });
        });

        test.describe('When the visitor fills in the required fields and submits the form', () => {
            test.beforeAll(async() => {
                await page.locator('#firstname').fill('Fred');
                await page.locator('#lastname').fill('Flintstone');
                await page.locator('#dob').fill('12/12/1954');
                await page.locator('#phone').fill('0203 458 2238');

                await page.locator('.m-form__submit').click();
            });

            test('Then a submitted details panel should be visible', async() => {
                await expect(page.locator('.card__content')).toBeVisible();
            });

            test('And the panel should have the heading "Submitted details 1"', async() => {
                await expect(page.locator('.card__content h4')).toHaveText(/Submitted details #1/);
            });

            test('And the form inputs should be reset', async() => {
                await expect(page.locator('#firstname')).toHaveValue('');
                await expect(page.locator('#lastname')).toHaveValue('');
                await expect(page.locator('#dob')).toHaveValue('');
                await expect(page.locator('#phone')).toHaveValue('');
            });

            test.describe('When the visitor fills in the form fields and submits the form again', () => {
                test.beforeAll(async() => {
                    await page.locator('#firstname').fill('Wilma');
                    await page.locator('#lastname').fill('Flintstone');
                    await page.locator('#email').fill('wilma.flintstone.com');
                    await page.locator('#dob').fill('23/05/1958');
                    await page.locator('#phone').fill('07938 445372');
    
                    await page.locator('.m-form__submit').click();
                });
    
                test('Then an invalid email address should be visible', async() => {
                    await expect(page.locator('#email-error-message')).toBeVisible();
                });
    
                test('And the email input should have an aria-describedby attribute', async() => {
                    await expect(page.locator('#email')).toHaveAttribute('aria-describedby', 'email-error-message');
                });
    
                test.describe('When the visitor corrects the email address and submits the form', () => {
                    test.beforeAll(async() => {
                        await page.locator('#email').fill('wilma@flintstone.com');
        
                        await page.locator('.m-form__submit').click();
                    });
        
                    test('Then a new submitted details panel should be visible', async() => {
                        await expect(page.locator('.card__content')).toHaveCount(2);
                    });
        
                    test('And the panel should have the heading "Submitted details 2"', async() => {
                        const secondPanel = await page.locator('.card__content').nth(1);
        
                        await expect(secondPanel.locator('h4')).toHaveText(/Submitted details #2/);
                    });

                    test('And the form inputs should be reset', async() => {
                        await expect(page.locator('#firstname')).toHaveValue('');
                        await expect(page.locator('#lastname')).toHaveValue('');
                        await expect(page.locator('#dob')).toHaveValue('');
                        await expect(page.locator('#phone')).toHaveValue('');
                    });

                    test('And the email input shoud not have an aria-describedby attribute', async() => {
                        await expect(page.locator('#email')).not.toHaveAttribute('aria-describedby');
                    });

                    test.describe('When the visitor click the delete button on the first panel', async() => {
                        test.beforeAll(async() => {
                            const firstPanel = await page.locator('.card__content').nth(0);

                            await firstPanel.locator('.delete-details-button').click();
                        });

                        test('Then the first details panel should not be visible', async() => {
                            await expect(page.locator('#submittedData0')).not.toBeVisible();
                        });

                        test('And the second details panel should still be visible', async() => {
                            await expect(page.locator('#submittedData1')).toBeVisible();
                            await expect(page.locator('.card__content')).toHaveCount(1);
                        });
                    });
                });
            });
        });
    });
});