// scripts/check-embeds.js
// Run with: node scripts/check-embeds.js

import { COURSES } from '../src/data/courses.js'

const results = { ok: [], blocked: [], missing: [] }

function extractVideoId(url) {
  // Handles both embed URLs and ?start= timestamp variants
  const match = url.match(/embed\/([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

async function checkEmbed(videoId) {
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
  try {
    const res = await fetch(oembedUrl)
    return res.status === 200 ? 'ok' : 'blocked'
  } catch {
    return 'missing'
  }
}

async function run() {
  const seen = new Set()

  for (const course of COURSES) {
    for (const lesson of course.lessons) {
      const id = extractVideoId(lesson.videoUrl)
      if (!id || seen.has(id)) continue
      seen.add(id)

      const status = await checkEmbed(id)
      const entry = { courseId: course.id, lessonId: lesson.id, videoId: id, title: lesson.title }

      results[status].push(entry)

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 150))
    }
  }

  console.log('\n✅ EMBEDDABLE:', results.ok.length)

  console.log('\n🚫 BLOCKED (embedding disabled):')
  if (results.blocked.length === 0) {
    console.log('  None — all clear!')
  } else {
    results.blocked.forEach(e =>
      console.log(`  ❌ [${e.courseId}] "${e.title}" → ${e.videoId}`)
    )
  }

  console.log('\n⚠️  MISSING (video deleted or private):')
  if (results.missing.length === 0) {
    console.log('  None — all clear!')
  } else {
    results.missing.forEach(e =>
      console.log(`  ⚠️  [${e.courseId}] "${e.title}" → ${e.videoId}`)
    )
  }
}

run()