import { readFileSync, writeFileSync } from 'node:fs'

const site = process.argv[2]
const origin = {
  coza: 'https://www.cape-frontier.co.za',
  com: 'https://www.cape-frontier.com',
}[site]

if (!origin) throw new Error(`Unknown site: ${site}`)

for (const file of ['robots.txt', 'sitemap.xml']) {
  const text = readFileSync(`scripts/templates/${file}`, 'utf8')
  writeFileSync(`dist/${site}/${file}`, text.replaceAll('{{ORIGIN}}', origin))
}

console.log(`postbuild: wrote robots.txt + sitemap.xml for ${site} (${origin})`)
