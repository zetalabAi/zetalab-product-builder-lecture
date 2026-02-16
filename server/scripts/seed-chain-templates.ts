/**
 * ZetaLab - Seed Chain Templates Script
 * Firestore에 초기 체인 템플릿을 등록하는 스크립트
 *
 * Usage: npx tsx server/scripts/seed-chain-templates.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { INITIAL_CHAIN_TEMPLATES } from '../data/initial-chain-templates';

// Initialize Firebase Admin
if (getApps().length === 0) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    ? require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : null;

  if (!serviceAccount) {
    console.error('Error: FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not set');
    console.error('Please set it to your Firebase service account JSON file path');
    console.error('Example: export FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json');
    process.exit(1);
  }

  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

async function seedChainTemplates() {
  console.log('🌱 Starting chain template seeding...');
  console.log(`📦 Found ${INITIAL_CHAIN_TEMPLATES.length} templates to seed`);

  const batch = db.batch();
  let successCount = 0;
  let skipCount = 0;

  for (const template of INITIAL_CHAIN_TEMPLATES) {
    try {
      const templateRef = db.collection('chainTemplates').doc(template.id);

      // Check if template already exists
      const existingDoc = await templateRef.get();

      if (existingDoc.exists) {
        console.log(`⏭️  Skipping ${template.name} (already exists)`);
        skipCount++;
        continue;
      }

      // Add to batch
      batch.set(templateRef, {
        ...template,
        createdAt: template.createdAt,
        updatedAt: new Date(),
      });

      successCount++;
      console.log(`✅ Queued ${template.name}`);
    } catch (error: any) {
      console.error(`❌ Failed to queue ${template.name}:`, error.message);
    }
  }

  // Commit batch
  if (successCount > 0) {
    try {
      await batch.commit();
      console.log(`\n🎉 Successfully seeded ${successCount} templates!`);
    } catch (error: any) {
      console.error(`\n❌ Batch commit failed:`, error.message);
      process.exit(1);
    }
  }

  if (skipCount > 0) {
    console.log(`⏭️  Skipped ${skipCount} existing templates`);
  }

  console.log('\n✨ Seeding complete!');
}

// Run seeding
seedChainTemplates()
  .then(() => {
    console.log('👋 Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
