import { test, expect } from "@playwright/test";

import { join, dirname } from "path";
import { readdirSync } from "fs";
import { fileURLToPath } from "url";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const __dirname = dirname(fileURLToPath(import.meta.url));

test.describe.serial("Performance measurement", () => {
  // reading test projects
  const projectsDir = join(__dirname, "..", "public", "projects");
  const projectNames = readdirSync(projectsDir);

  // create a test for each project
  for (const projectName of projectNames) {
    console.log(projectName);

    const json = require(`../public/projects/${projectName}/measure.json`);
    console.dir(json);

    test(`Test project "${projectName}"`, async ({ page }) => {
      await page.goto("/");

      await expect(page).toHaveTitle(/^qgis-js-performance$/);

      const btnBoot = page.locator("#boot");
      const btnProject = page.locator("#project");
      const btnFrame = page.locator("#frame");
      const btnStart = page.locator("#start");

      await test.step("Boot runtime", async () => {
        expect(btnBoot).not.toBeNull();
        await btnBoot?.click();
        await expect(btnProject).toBeEnabled();
      });

      await test.step("Load project", async () => {
        expect(btnProject).not.toBeNull();

        const inpProject = page.locator("#project-input");
        expect(btnProject).not.toBeNull();
        await inpProject.fill(projectName);

        await btnProject?.click();

        await expect(btnFrame).toBeEnabled({ timeout: 10000 });
      });

      await test.step("Render first frame", async () => {
        expect(btnFrame).not.toBeNull();

        await btnFrame?.click();

        await expect(btnStart).toBeEnabled({ timeout: 10000 });
      });

      await test.step("Run performance measurement", async () => {
        expect(btnStart).not.toBeNull();

        const inpExtent = page.locator("#start-extent-input");
        expect(btnProject).not.toBeNull();
        await inpExtent.fill(JSON.stringify(json.extent, undefined, ""));

        const inpResolution = page.locator("#start-resolution-input");
        expect(inpResolution).not.toBeNull();
        await inpResolution.fill(
          JSON.stringify(json.resolution, undefined, ""),
        );

        await btnStart?.click();

        await page.waitForSelector("#results");

        // wait until div with id "loader" is gone
        await page.waitForSelector("#loading", { state: "detached" });
      });

      console.log("test done");
    });
  }
});
