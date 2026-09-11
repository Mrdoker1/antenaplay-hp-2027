#!/usr/bin/env node
/**
 * Minimal JSON-RPC client for the Figma Dev Mode MCP server.
 *
 * The desktop app serves it on http://127.0.0.1:3845/mcp over streamable HTTP.
 * This talks to it directly, which is useful when the editor's own MCP client
 * is disconnected but the app is still running. As always, the server only sees
 * the document in Figma's frontmost tab.
 *
 *   node scripts/figma-mcp.mjs <tool> '<jsonArgs>' [outFile]
 *   node scripts/figma-mcp.mjs --tools
 */
const BASE = 'http://127.0.0.1:3845/mcp'

/** The server frames replies as SSE even for single responses. */
function parseBody(text) {
  const lines = text.split('\n')
  const payloads = []
  for (const line of lines) {
    if (line.startsWith('data:')) payloads.push(line.slice(5).trim())
  }
  const raw = payloads.length ? payloads.join('') : text.trim()
  return raw ? JSON.parse(raw) : null
}

let sessionId = null

async function rpc(method, params, { notify = false } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  }
  if (sessionId) headers['mcp-session-id'] = sessionId

  const body = notify
    ? { jsonrpc: '2.0', method, params }
    : { jsonrpc: '2.0', id: Date.now(), method, params }

  const res = await fetch(BASE, { method: 'POST', headers, body: JSON.stringify(body) })
  const sid = res.headers.get('mcp-session-id')
  if (sid) sessionId = sid
  if (notify) return null

  const text = await res.text()
  const msg = parseBody(text)
  if (msg?.error) throw new Error(`${method}: ${msg.error.message ?? JSON.stringify(msg.error)}`)
  return msg?.result
}

async function connect() {
  await rpc('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'antena-extract', version: '1.0.0' },
  })
  await rpc('notifications/initialized', {}, { notify: true })
}

const [tool, argsJson, outFile] = process.argv.slice(2)
await connect()

if (tool === '--tools') {
  const { tools } = await rpc('tools/list', {})
  console.log(tools.map((t) => t.name).join('\n'))
  process.exit(0)
}

const result = await rpc('tools/call', {
  name: tool,
  arguments: argsJson ? JSON.parse(argsJson) : {},
})

const parts = result?.content ?? []
const text = parts
  .filter((c) => c.type === 'text')
  .map((c) => c.text)
  .join('\n')
// get_screenshot answers with an image part, not text
const image = parts.find((c) => c.type === 'image' && c.data)

if (outFile) {
  const { writeFile } = await import('node:fs/promises')
  if (image) {
    const buf = Buffer.from(image.data, 'base64')
    await writeFile(outFile, buf)
    console.log(`${outFile}  ${buf.length} bytes  ${image.mimeType ?? 'image'}`)
  } else {
    await writeFile(outFile, text)
    console.log(`${outFile}  ${text.length} chars${result?.isError ? '  (isError)' : ''}`)
  }
} else {
  console.log(text.slice(0, 1500) || `(image, ${image ? image.data.length : 0} b64 chars)`)
}
