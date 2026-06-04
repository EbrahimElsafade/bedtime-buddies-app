import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react'

type CheckStatus = 'pending' | 'ok' | 'fail'

interface Check {
  name: string
  url: string
  description: string
  status: CheckStatus
  latencyMs?: number
  error?: string
}

const INITIAL_CHECKS: Omit<Check, 'status'>[] = [
  {
    name: 'Custom domain',
    url: 'https://thedolphoon.com/',
    description: 'Root document on the production custom domain',
  },
  {
    name: 'Lovable published URL',
    url: 'https://bedtime-buddies-app.lovable.app/',
    description: 'Underlying Lovable hosting endpoint',
  },
  {
    name: 'Manifest',
    url: '/manifest.json',
    description: 'PWA manifest static asset',
  },
  {
    name: 'Robots',
    url: '/robots.txt',
    description: 'SEO crawler directives',
  },
  {
    name: 'Sitemap',
    url: '/sitemap.xml',
    description: 'Search engine sitemap',
  },
  {
    name: 'Locale (English)',
    url: '/locales/en/misc.json',
    description: 'English translation bundle',
  },
  {
    name: 'Locale (Arabic)',
    url: '/locales/ar/misc.json',
    description: 'Arabic translation bundle',
  },
  {
    name: 'Locale (French)',
    url: '/locales/fr/misc.json',
    description: 'French translation bundle',
  },
]

async function runCheck(url: string): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const started = performance.now()
  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store', mode: 'cors' })
    const latencyMs = Math.round(performance.now() - started)
    if (!res.ok) return { ok: false, latencyMs, error: `HTTP ${res.status}` }
    return { ok: true, latencyMs }
  } catch (err) {
    const latencyMs = Math.round(performance.now() - started)
    return { ok: false, latencyMs, error: err instanceof Error ? err.message : 'Network error' }
  }
}

const Status = () => {
  const [checks, setChecks] = useState<Check[]>(
    INITIAL_CHECKS.map((c) => ({ ...c, status: 'pending' })),
  )
  const [running, setRunning] = useState(false)
  const [lastRunAt, setLastRunAt] = useState<string | null>(null)

  const runAll = async () => {
    setRunning(true)
    setChecks(INITIAL_CHECKS.map((c) => ({ ...c, status: 'pending' })))
    const results = await Promise.all(
      INITIAL_CHECKS.map(async (c) => {
        const r = await runCheck(c.url)
        return {
          ...c,
          status: (r.ok ? 'ok' : 'fail') as CheckStatus,
          latencyMs: r.latencyMs,
          error: r.error,
        }
      }),
    )
    setChecks(results)
    setLastRunAt(new Date().toISOString())
    setRunning(false)
  }

  useEffect(() => {
    runAll()
  }, [])

  const okCount = checks.filter((c) => c.status === 'ok').length
  const failCount = checks.filter((c) => c.status === 'fail').length
  const allOk = !running && failCount === 0 && okCount === checks.length

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <Helmet>
        <title>Deployment Status — Dolphoon</title>
        <meta name="description" content="Live deployment status and reachability checks for Dolphoon." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Deployment Status</h1>
        <p className="text-muted-foreground">
          Live reachability checks executed from your browser against the production endpoints.
        </p>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Current release</CardTitle>
              <CardDescription>Build metadata embedded at deploy time.</CardDescription>
            </div>
            <Badge variant={allOk ? 'default' : running ? 'secondary' : 'destructive'}>
              {running ? 'Checking…' : allOk ? 'All systems normal' : `${failCount} issue${failCount === 1 ? '' : 's'}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <div className="text-muted-foreground">Version</div>
            <div className="font-mono">{__APP_VERSION__}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Build mode</div>
            <div className="font-mono">{__BUILD_MODE__}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Built at</div>
            <div className="font-mono">{__BUILD_TIME__}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Current host</div>
            <div className="font-mono">{typeof window !== 'undefined' ? window.location.host : ''}</div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {lastRunAt ? `Last checked: ${new Date(lastRunAt).toLocaleString()}` : 'Running checks…'}
        </div>
        <Button onClick={runAll} disabled={running} size="sm" variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${running ? 'animate-spin' : ''}`} />
          Re-run checks
        </Button>
      </div>

      <div className="space-y-3">
        {checks.map((c) => (
          <Card key={c.name}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex-shrink-0">
                {c.status === 'pending' && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                {c.status === 'ok' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                {c.status === 'fail' && <XCircle className="h-5 w-5 text-destructive" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{c.name}</span>
                  {c.status === 'ok' && c.latencyMs != null && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      {c.latencyMs} ms
                    </Badge>
                  )}
                  {c.status === 'fail' && (
                    <Badge variant="destructive" className="text-xs">
                      {c.error || 'Failed'}
                    </Badge>
                  )}
                </div>
                <div className="truncate text-xs text-muted-foreground">{c.description}</div>
                <div className="truncate font-mono text-xs text-muted-foreground">{c.url}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Note: checks run from your browser. A failure here may indicate either a real outage or a local network/ISP issue
        on your device. Cross-origin endpoints rely on CORS; opaque failures are reported as network errors.
      </p>
    </div>
  )
}

export default Status
