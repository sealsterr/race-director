#!/usr/bin/env node

const webhookUrl = process.env.DISCORD_RELEASE_WEBHOOK_URL?.trim()
const releaseTag = process.env.RELEASE_TAG?.trim()
const releaseUrl = process.env.RELEASE_URL?.trim()
const repository = process.env.GITHUB_REPOSITORY?.trim() ?? 'sealsterr/race-director'
const roleId = process.env.DISCORD_RELEASE_ROLE_ID?.trim()

if (!webhookUrl) {
  console.log('Discord release announcement skipped: DISCORD_RELEASE_WEBHOOK_URL is not set.')
  process.exit(0)
}

if (!releaseTag || !releaseUrl) {
  throw new Error('RELEASE_TAG and RELEASE_URL are required for Discord release announcements.')
}

const version = releaseTag.replace(/^v/i, '')
const content = roleId
  ? `<@&${roleId}> RaceDirector ${releaseTag} is live.`
  : `RaceDirector ${releaseTag} is live.`

const payload = {
  content,
  allowed_mentions: {
    roles: roleId ? [roleId] : []
  },
  embeds: [
    {
      title: `RaceDirector ${releaseTag}`,
      url: releaseUrl,
      description:
        'A new release is available!',
      color: 0xe85d27,
      fields: [
        {
          name: 'Version',
          value: version,
          inline: true
        },
        {
          name: 'Download',
          value: `[GitHub Release](${releaseUrl})`,
          inline: true
        },
        {
          name: 'Repository',
          value: repository,
          inline: false
        }
      ],
      footer: {
        text: 'RaceDirector release'
      },
      timestamp: new Date().toISOString()
    }
  ]
}

const response = await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'content-type': 'application/json'
  },
  body: JSON.stringify(payload)
})

if (!response.ok) {
  const body = await response.text()
  throw new Error(`Discord webhook failed with ${response.status}: ${body}`)
}

console.log(`Discord release announcement sent for ${releaseTag}.`)
