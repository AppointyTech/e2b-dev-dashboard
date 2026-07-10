import 'server-only'

import {
  Configuration,
  FlowType,
  FrontendApi,
  handleFlowError,
  type LoginFlow,
  type RecoveryFlow,
  type RegistrationFlow,
  type SettingsFlow,
  type VerificationFlow,
} from '@ory/client-fetch'
import { headers } from 'next/headers'
import { redirect, RedirectType } from 'next/navigation'
import type { ApiResponse } from '@ory/client-fetch/dist/runtime'
import { getPublicOriginForRequest } from './request-config'

type QueryParams = Record<string, string | string[] | undefined>
type Flow =
  | LoginFlow
  | RegistrationFlow
  | RecoveryFlow
  | VerificationFlow
  | SettingsFlow

const initOverrides = { cache: 'no-cache' } satisfies RequestInit

let cachedFrontendApi: FrontendApi | null = null

function getOrySdkUrl(): string {
  const basePath = process.env.ORY_SDK_URL ?? process.env.NEXT_PUBLIC_ORY_SDK_URL
  if (!basePath) {
    throw new Error('ORY_SDK_URL / NEXT_PUBLIC_ORY_SDK_URL is not configured')
  }

  return basePath.replace(/\/$/, '')
}

function getServerSideFrontendClient(): FrontendApi {
  if (cachedFrontendApi) return cachedFrontendApi

  cachedFrontendApi = new FrontendApi(
    new Configuration({
      basePath: getOrySdkUrl(),
      headers: { Accept: 'application/json' },
    })
  )

  return cachedFrontendApi
}

async function getCookieHeader(): Promise<string | undefined> {
  return (await headers()).get('cookie') ?? undefined
}

function getFirstParam(
  params: QueryParams,
  key: string
): string | undefined {
  const value = params[key]
  if (Array.isArray(value)) return value[0]
  return value
}

async function toGetFlowParameter(params: QueryParams) {
  return {
    id: getFirstParam(params, 'flow') ?? '',
    cookie: await getCookieHeader(),
  }
}

function stringifyQueryParam(param: string | undefined): string | null {
  if (typeof param !== 'string') return null
  return param
}

function toSearchParams(query: QueryParams): URLSearchParams {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        const stringValue = stringifyQueryParam(item)
        if (stringValue !== null) searchParams.append(key, stringValue)
      }
      continue
    }

    const stringValue = stringifyQueryParam(value)
    if (stringValue !== null) searchParams.set(key, stringValue)
  }

  return searchParams
}

async function getDashboardOrigin(): Promise<string> {
  const origin = await getPublicOriginForRequest()
  if (origin) return origin

  return getOrySdkUrl()
}

function startNewFlow(
  params: QueryParams,
  flowType: FlowType,
  dashboardOrigin: string
): never {
  redirect(
    new URL(
      `/self-service/${flowType}/browser?${toSearchParams(params).toString()}`,
      dashboardOrigin
    ).toString(),
    RedirectType.replace
  )
}

function rewriteOryUrls<T>(value: T, dashboardOrigin: string): T {
  if (Array.isArray(value)) {
    return value.map((item) => rewriteOryUrls(item, dashboardOrigin)) as T
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .map(([key, child]) => [key, rewriteOryUrls(child, dashboardOrigin)])
    ) as T
  }

  if (typeof value === 'string') {
    return value.replaceAll(getOrySdkUrl(), dashboardOrigin) as T
  }

  return value
}

async function getFlow<T extends Flow>(
  paramsOrPromise: QueryParams | Promise<QueryParams>,
  fetchFlowRaw: (params: QueryParams) => Promise<ApiResponse<T>>,
  flowType: FlowType,
  route: string
): Promise<T | null | void> {
  const params = await paramsOrPromise
  const dashboardOrigin = await getDashboardOrigin()

  const restartFlow = (useFlowId?: string): never => {
    if (!useFlowId) return startNewFlow(params, flowType, dashboardOrigin)

    const redirectTo = new URL(route, dashboardOrigin)
    redirectTo.search = new URLSearchParams({
      ...params,
      flow: useFlowId,
    }).toString()

    redirect(redirectTo.toString(), RedirectType.replace)
  }

  if (!getFirstParam(params, 'flow')) {
    restartFlow()
  }

  try {
    const rawResponse = await fetchFlowRaw(params)
    const value = await rawResponse.value()
    return rewriteOryUrls(value, dashboardOrigin)
  } catch (error) {
    const errorHandler = handleFlowError<T>({
      onValidationError: (body) => body,
      onRestartFlow: restartFlow,
      onRedirect: (url) => redirect(url),
    })

    return errorHandler(error)
  }
}

export function getDashboardLoginFlow(
  params: QueryParams | Promise<QueryParams>
): Promise<LoginFlow | null | void> {
  return getFlow<LoginFlow>(
    params,
    async (resolvedParams) =>
      getServerSideFrontendClient().getLoginFlowRaw(
        await toGetFlowParameter(resolvedParams),
        initOverrides
      ),
    FlowType.Login,
    '/login'
  )
}

export function getDashboardRegistrationFlow(
  params: QueryParams | Promise<QueryParams>
) {
  return getFlow<RegistrationFlow>(
    params,
    async (resolvedParams) =>
      getServerSideFrontendClient().getRegistrationFlowRaw(
        await toGetFlowParameter(resolvedParams),
        initOverrides
      ),
    FlowType.Registration,
    '/registration'
  )
}

export function getDashboardRecoveryFlow(
  params: QueryParams | Promise<QueryParams>
) {
  return getFlow<RecoveryFlow>(
    params,
    async (resolvedParams) =>
      getServerSideFrontendClient().getRecoveryFlowRaw(
        await toGetFlowParameter(resolvedParams),
        initOverrides
      ),
    FlowType.Recovery,
    '/recovery'
  )
}

export function getDashboardVerificationFlow(
  params: QueryParams | Promise<QueryParams>
) {
  return getFlow<VerificationFlow>(
    params,
    async (resolvedParams) =>
      getServerSideFrontendClient().getVerificationFlowRaw(
        await toGetFlowParameter(resolvedParams),
        initOverrides
      ),
    FlowType.Verification,
    '/verification'
  )
}

export function getDashboardSettingsFlow(
  params: QueryParams | Promise<QueryParams>
) {
  return getFlow<SettingsFlow>(
    params,
    async (resolvedParams) =>
      getServerSideFrontendClient().getSettingsFlowRaw(
        await toGetFlowParameter(resolvedParams),
        initOverrides
      ),
    FlowType.Settings,
    '/settings'
  )
}
