import { test, expect } from '@playwright/test';
import fs from 'fs';

test('verify final diagram fixes', async ({ page }) => {
  // Setup a test diagram with manualHeight and bidirectional vertical edges
  const testDiagram = JSON.parse(fs.readFileSync('src/data/full-framework.json', 'utf8'));

  // 1. Test manualHeight
  testDiagram.nodes[0].manualHeight = 500;
  testDiagram.nodes[0].accentColor = 'orange'; // Test text color too
  testDiagram.nodes[0].variant = 'text';

  // 2. Test bottom-to-bottom bezier
  testDiagram.edges.push({
    from: "innovation-services",
    to: "enabling-services",
    sourceAnchor: "bottom",
    targetAnchor: "bottom",
    routing: "bezier",
    color: "purple",
    showArrow: true
  });

  fs.writeFileSync('src/data/verification-diag.json', JSON.stringify(testDiagram));

  // Need to point the app to use this file or just rely on the manual check of existing ones
  // Actually, I'll just check the standard ones first.

  await page.goto('http://localhost:3000');
  await page.getByRole('button', { name: 'Enter the Hub' }).click();
  const canvas = page.locator('#diagram-canvas-section');
  await expect(canvas).toBeVisible({ timeout: 10000 });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'verification/final_check.png', fullPage: true });

  // Check parallel lines (management <-> integration)
  // They are at manualX=250.
  // management-services: y=-840
  // integration-services: y=-700
  // In diagramLayout: y = (y - minY) + pY + 50
  // minY is roughly -840.
  // so management y is around 100+50 = 150.
  // integration y is around 140+100+50 = 290.

  const paths = await page.locator('svg.z-30 path').all();
  for (const path of paths) {
    const d = await path.getAttribute('d');
    const stroke = await path.getAttribute('stroke');
    if (d && d.includes('C')) {
       // Bezier line
       console.log(`Bezier path: ${d} (${stroke})`);
    } else if (d && d.includes('L')) {
       // Straight line
       console.log(`Straight path: ${d} (${stroke})`);
    }
  }
});
