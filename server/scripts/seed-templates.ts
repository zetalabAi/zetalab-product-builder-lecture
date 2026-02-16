/**
 * Seed Script for Initial Templates
 * Run once to populate Firestore with official templates
 *
 * Usage: npx tsx server/scripts/seed-templates.ts
 */

import { initialTemplates } from '../data/initial-templates';
import { createPromptTemplate } from '../db';

const SYSTEM_USER_ID = 'system-zetalab-official';

async function seedTemplates() {
  console.log('🌱 Starting template seeding...');
  console.log(`📦 Found ${initialTemplates.length} templates to seed\n`);

  let successCount = 0;
  let failCount = 0;

  for (const template of initialTemplates) {
    try {
      const templateId = await createPromptTemplate({
        ...template,
        userId: SYSTEM_USER_ID,
      });

      console.log(`✅ Created: ${template.title} (ID: ${templateId})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed: ${template.title}`);
      console.error(`   Error: ${error instanceof Error ? error.message : error}`);
      failCount++;
    }
  }

  console.log('\n📊 Seeding Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📝 Total: ${initialTemplates.length}`);

  if (failCount > 0) {
    console.log('\n⚠️  Some templates failed to seed. Please check the errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All templates seeded successfully!');
    process.exit(0);
  }
}

// Run the seeding
seedTemplates().catch((error) => {
  console.error('💥 Fatal error during seeding:', error);
  process.exit(1);
});
