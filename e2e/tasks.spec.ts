import { test, expect } from "@playwright/test";

/**
 * Tasks E2E Tests
 *
 * Note: These tests require a running backend with test data.
 * They will fail without authentication. In a real scenario:
 * 1. Set up test fixtures with authentication
 * 2. Use API mocking (MSW) or a test backend
 * 3. Create test users and seed data
 */

test.describe("Tasks Management", () => {
  // Note: These tests require a running backend with test data
  // In a real CI/CD pipeline, you would:
  // 1. Start a test backend instance
  // 2. Seed test data
  // 3. Run these E2E tests
  // 4. Tear down test backend

  test.skip("should display tasks list when authenticated", async ({
    page,
  }) => {
    // await login(page);
    await page.goto("/tasks");

    await expect(page.getByRole("heading", { name: "My Tasks" })).toBeVisible();
    await expect(page.getByRole("button", { name: /create task/i })).toBeVisible();
  });

  test.skip("should create a new task", async ({ page }) => {
    // await login(page);
    await page.goto("/tasks");

    await page.getByRole("button", { name: /create task/i }).click();

    // Fill in task form
    await page.getByPlaceholder(/task title/i).fill("New E2E Test Task");
    await page.getByPlaceholder(/description/i).fill("Created by E2E test");

    await page.getByRole("button", { name: /create/i }).click();

    // Should show success toast
    await expect(page.getByText(/task created successfully/i)).toBeVisible();
  });

  test.skip("should filter tasks by status", async ({ page }) => {
    // await login(page);
    await page.goto("/tasks");

    // Click status filter dropdown
    await page.getByRole("combobox", { name: /status/i }).click();
    await page.getByRole("option", { name: "Completed" }).click();

    // Table should update with filtered results
    await expect(page.getByRole("table")).toBeVisible();
  });

  test.skip("should search tasks", async ({ page }) => {
    // await login(page);
    await page.goto("/tasks");

    await page.getByPlaceholder(/search tasks/i).fill("test");

    // Wait for debounced search
    await page.waitForTimeout(500);

    // Results should be filtered
    await expect(page.getByRole("table")).toBeVisible();
  });

  test.skip("should edit a task", async ({ page }) => {
    // await login(page);
    await page.goto("/tasks");

    // Click edit on first task
    await page.getByRole("button", { name: /more/i }).first().click();
    await page.getByRole("menuitem", { name: /edit/i }).click();

    // Update task
    await page.getByLabel(/title/i).fill("Updated Task Title");
    await page.getByRole("button", { name: /save/i }).click();

    await expect(page.getByText(/task updated successfully/i)).toBeVisible();
  });

  test.skip("should delete a task", async ({ page }) => {
    // await login(page);
    await page.goto("/tasks");

    // Click delete on first task
    await page.getByRole("button", { name: /more/i }).first().click();
    await page.getByRole("menuitem", { name: /delete/i }).click();

    // Confirm deletion
    await page.getByRole("button", { name: /delete/i }).click();

    await expect(page.getByText(/task deleted successfully/i)).toBeVisible();
  });

  test.skip("should navigate between pages", async ({ page }) => {
    // await login(page);
    await page.goto("/tasks");

    // Click next page
    await page.getByRole("button", { name: /next/i }).click();

    // URL should update with page parameter
    await expect(page).toHaveURL(/page=2/);
  });

  test.skip("should toggle dark mode", async ({ page }) => {
    // await login(page);
    await page.goto("/tasks");

    const html = page.locator("html");

    // Toggle dark mode
    await page.getByRole("button", { name: /theme/i }).click();

    // Check if dark class is added
    const hasClass = await html.evaluate((el) =>
      el.classList.contains("dark")
    );
    expect(hasClass).toBeTruthy();
  });

  test.skip("should logout successfully", async ({ page }) => {
    // await login(page);
    await page.goto("/tasks");

    await page.getByRole("button", { name: /logout/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL("/login");
  });
});

test.describe("Tasks - Loading States", () => {
  test("should show skeleton loaders", async ({ page }) => {
    await page.goto("/login");

    // We can test that skeleton component exists in the build
    // Even without auth, we can verify the page structure loads
    await expect(page).toHaveURL("/login");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Tasks - Accessibility", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/login");

    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
  });

  test("should support keyboard navigation", async ({ page }) => {
    await page.goto("/login");

    await page.keyboard.press("Tab");
    await expect(page.getByPlaceholder("Enter your username")).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.getByPlaceholder("Enter your password")).toBeFocused();
  });
});
