import * as os from 'node:os'
import { randomUUID, createHash } from 'node:crypto'

export const onRequestGet = async ({ request }) => {
  const info = {
    nodeVersion: process.version,
    pid: process.pid,
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus()?.length ?? 0,
    totalMem: os.totalmem(),
    freeMem: os.freemem(),
    uptimeSec: process.uptime(),
    randomUUID: randomUUID(),
    now: new Date().toISOString(),
    url: request.url,
  }

  console.log('=====info=====', info);

  return new Response(JSON.stringify(info), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
  })
}

export const onRequestPost = async ({ request }) => {
  const contentType = request.headers.get('content-type') || ''
  const bodyText = await request.text()

  const hash = createHash('sha256').update(bodyText, 'utf8').digest('hex')

  const res = {
    receivedAt: new Date().toISOString(),
    contentType,
    bodyLength: bodyText.length,
    sha256: hash,
    randomUUID: randomUUID(),
  }

  return new Response(JSON.stringify(res), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
  })
}


