import { RedirectType, redirect } from 'next/navigation'

type QueryParams = {
  [key: string]: string | string[] | undefined
}

type BrowserFlowType =
  | 'login'
  | 'registration'
  | 'recovery'
  | 'verification'
  | 'settings'

export function buildOryBrowserFlowPath(
  flowType: BrowserFlowType,
  params: QueryParams
): string {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, item)
      }
      continue
    }

    searchParams.set(key, value)
  }

  const query = searchParams.toString()
  return `/self-service/${flowType}/browser${query ? `?${query}` : ''}`
}

export async function redirectToOryBrowserFlowIfMissing(
  flowType: BrowserFlowType,
  params: QueryParams | Promise<QueryParams>
): Promise<QueryParams> {
  const resolvedParams = await params

  if (!resolvedParams.flow) {
    redirect(
      buildOryBrowserFlowPath(flowType, resolvedParams),
      RedirectType.replace
    )
  }

  return resolvedParams
}
