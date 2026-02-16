/**
 * Seed Script for Initial Courses
 *
 * Run this once in production to populate Firestore with initial courses
 * Usage: npx tsx server/scripts/seed-courses.ts
 */

import { createCourse } from '../db';
import { INITIAL_COURSES } from '../data/initial-courses';

async function seedCourses() {
  console.log('🌱 Starting course seeding...\n');

  let successCount = 0;
  let failCount = 0;

  for (const courseData of INITIAL_COURSES) {
    try {
      console.log(`📚 Creating course: ${courseData.title}`);
      const courseId = await createCourse(courseData);
      console.log(`✅ Created successfully with ID: ${courseId}\n`);
      successCount++;
    } catch (error: any) {
      console.error(`❌ Failed to create "${courseData.title}":`, error.message);
      console.error(error);
      console.log('');
      failCount++;
    }
  }

  console.log('📊 Seeding Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📚 Total: ${INITIAL_COURSES.length}`);

  if (failCount === 0) {
    console.log('\n🎉 All courses seeded successfully!');
  } else {
    console.log('\n⚠️ Some courses failed to seed. Check errors above.');
    process.exit(1);
  }
}

// Run seeding
seedCourses()
  .then(() => {
    console.log('\n✨ Seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
