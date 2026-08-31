import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const fail = (message) => {
  console.error(`FAIL: ${message}`)
  process.exitCode = 1
}

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean)
if (tracked.includes('.env.local')) fail('.env.local è tracciato da Git')
if (!tracked.includes('.env.example')) fail('.env.example non è tracciato da Git')

try {
  execFileSync('git', ['check-ignore', '-q', '.env.local'])
} catch {
  fail('.env.local non è coperto da .gitignore')
}

const example = readFileSync('.env.example', 'utf8').trim().split(/\r?\n/)
const expected = ['VITE_SUPABASE_URL=', 'VITE_SUPABASE_ANON_KEY=']
if (JSON.stringify(example) !== JSON.stringify(expected)) {
  fail('.env.example deve contenere solo le due variabili Supabase vuote')
}

const secretPatterns = [
  /sb_secret_[A-Za-z0-9._-]{20,}/g,
  /sk-[A-Za-z0-9_-]{20,}/g,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
]

const scan = (file, content) => {
  for (const pattern of secretPatterns) {
    pattern.lastIndex = 0
    if (pattern.test(content)) fail(`possibile segreto in ${file}`)
  }
}

for (const file of tracked) {
  if (file === 'package-lock.json' || !existsSync(file) || statSync(file).size > 2_000_000) continue
  scan(file, readFileSync(file, 'utf8'))
}

const scanDirectory = (directory) => {
  if (!existsSync(directory)) return
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry)
    if (statSync(path).isDirectory()) scanDirectory(path)
    else if (statSync(path).size < 2_000_000) scan(path, readFileSync(path, 'utf8'))
  }
}
scanDirectory('dist')

if (!process.exitCode) console.log('PASS: env ignorato, repository e bundle senza segreti riconoscibili')
