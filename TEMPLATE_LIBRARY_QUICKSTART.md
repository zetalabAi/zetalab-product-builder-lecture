# Template Library - Quick Start Guide

## 🚀 Setup (First Time Only)

### 1. Seed Initial Templates

Run this command to populate Firestore with 15 official templates:

```bash
npx tsx server/scripts/seed-templates.ts
```

Expected output:
```
🌱 Starting template seeding...
📦 Found 15 templates to seed

✅ Created: SEO 최적화 블로그 글 (ID: abc123...)
✅ Created: 스토리텔링 블로그 (ID: def456...)
...
✅ Created: 프로젝트 제안서 (ID: xyz789...)

📊 Seeding Summary:
   ✅ Success: 15
   ❌ Failed: 0
   📝 Total: 15

🎉 All templates seeded successfully!
```

### 2. Verify in Firebase Console

1. Go to https://console.firebase.google.com
2. Select project: `zetalabai-4e5d3`
3. Navigate to Firestore Database
4. Check `promptTemplates` collection
5. Verify 15 documents exist with:
   - `isOfficial: true`
   - `isPublic: true`
   - `variables: [...]` array

## 🧪 Testing the Feature

### Local Development

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to templates page:**
   - Open http://localhost:5000/templates
   - Or click "템플릿" in sidebar

3. **Test browsing:**
   - [ ] See 15 templates in grid layout
   - [ ] Click category filters (전체, 블로그, 소설, 영상, 발표자료)
   - [ ] Verify filtering works

4. **Test template usage:**
   - [ ] Click a template card → Modal opens
   - [ ] Read template description
   - [ ] Fill in variable fields
   - [ ] Watch preview update in real-time
   - [ ] Try submitting with missing required field → See validation error
   - [ ] Fill all required fields
   - [ ] Click "프롬프트 생성"
   - [ ] Verify navigation to `/intent/new` with prefilled prompt

5. **Test responsive design:**
   - [ ] Resize browser window
   - [ ] Verify grid changes: 3 cols → 2 cols → 1 col
   - [ ] Test on mobile device (Chrome DevTools)
   - [ ] Verify modal is scrollable and centered

6. **Test authentication:**
   - [ ] Logout (if logged in)
   - [ ] Try to use a template
   - [ ] Verify login modal appears
   - [ ] Login and try again

### Example: Testing "SEO 최적화 블로그 글"

1. Click the "SEO 최적화 블로그 글" template
2. Fill in the form:
   - **주제**: "AI 트렌드 2026"
   - **대상 독자**: "마케팅 초보자"
   - **글의 톤**: "친근한" (select dropdown)
   - **목표 키워드**: "AI 활용법"
   - **글자 수**: "1500"

3. Preview should show:
   ```
   AI 트렌드 2026에 대한 SEO 최적화 블로그 글을 작성해주세요.

   대상 독자: 마케팅 초보자
   글의 톤: 친근한
   목표 키워드: AI 활용법
   글자 수: 1500자
   ...
   ```

4. Click "프롬프트 생성"
5. Verify navigation to `/intent/new?prompt=...`
6. Verify prompt is prefilled in intent clarification page

## 🐛 Troubleshooting

### Seeding Script Fails

**Error: Firebase credentials not found**
```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
npx tsx server/scripts/seed-templates.ts
```

**Error: Templates already exist**
- Delete existing templates in Firestore console
- Or modify script to skip duplicates

### Templates Not Showing

1. **Check Firestore:**
   - Verify `promptTemplates` collection exists
   - Verify documents have `isPublic: true`

2. **Check console for errors:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed API calls

3. **Check backend logs:**
   - Terminal running `npm run dev`
   - Look for errors in API calls

### Variables Not Replacing

1. **Check template syntax:**
   - Variables must be in format: `{{variableName}}`
   - No spaces: `{{ name }}` ❌ `{{name}}` ✅

2. **Check variable names:**
   - Must match exactly (case-sensitive)
   - Example: `{{topic}}` not `{{Topic}}`

## 📊 Monitoring Usage

### Check Usage Count

In Firestore console, check `promptTemplates` documents:
- `usageCount` field should increment each time template is used
- Sort by `usageCount` descending to see most popular templates

### Analytics (Future)

Track in Google Analytics:
- Event: `template_used`
- Parameters: `template_id`, `category`, `user_id`

## 🚢 Deployment

### Production Deployment

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase:**
   ```bash
   firebase deploy
   ```

3. **Verify production:**
   - Visit https://zetalabai-4e5d3.web.app/templates
   - Test browsing and using templates
   - Verify authentication works

4. **Monitor:**
   - Check Firebase Console > Functions > Logs
   - Check Firestore for usage count increments
   - Check for any errors in production

## 📝 Adding New Templates

1. **Edit template data:**
   ```typescript
   // server/data/initial-templates.ts

   {
     title: 'Your Template Title',
     description: 'Template description',
     category: 'blog', // or 'novel', 'video', 'presentation'
     tags: ['tag1', 'tag2'],
     templateContent: `Your template content with {{variables}}`,
     isPublic: true,
     isOfficial: true,
     usageCount: 0,
     variables: [
       {
         name: 'variableName',
         label: '변수 레이블',
         placeholder: '예시 값',
         required: true,
         type: 'text', // or 'textarea', 'select'
       },
     ],
   }
   ```

2. **Re-run seeding:**
   ```bash
   npx tsx server/scripts/seed-templates.ts
   ```

3. **Test new template:**
   - Refresh `/templates` page
   - Find your new template
   - Test variable filling and prompt generation

## 🎯 Success Criteria

✅ All 15 templates are visible
✅ Category filtering works correctly
✅ Template modal opens and closes
✅ Variables can be filled in
✅ Preview updates in real-time
✅ Validation prevents submission with missing required fields
✅ "프롬프트 생성" navigates to `/intent/new` with prefilled prompt
✅ Usage count increments in Firestore
✅ Responsive design works on mobile
✅ Authentication is required for "프롬프트 생성"

---

**Need Help?**
- Check `FEATURE_6_TEMPLATE_LIBRARY_COMPLETE.md` for detailed implementation notes
- Check console logs for errors
- Verify Firestore data structure matches schema
