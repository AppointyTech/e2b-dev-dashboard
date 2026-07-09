import Link from 'next/link'
import { AUTH_URLS, PROTECTED_URLS } from '@/configs/urls'
import { Button } from '@/ui/primitives/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/ui/primitives/card'
import { ArrowLeftIcon, GridIcon, HomeIcon } from '@/ui/primitives/icons'

type ErrorPageProps = {
  searchParams: Promise<{
    error?: string
    error_description?: string
  }>
}

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const { error, error_description: errorDescription } = await searchParams
  const title = error ? humanizeError(error) : 'Authentication error'

  return (
    <div className="flex min-h-svh w-full items-start justify-center px-4 pt-16 md:pt-24">
      <Card className="w-full max-w-md border border-stroke bg-bg-1/40 backdrop-blur-lg">
        <CardHeader className="text-center">
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            The sign-in flow could not be completed.
          </CardDescription>
        </CardHeader>
        {errorDescription && (
          <CardContent className="text-center text-fg-secondary">
            <p>{errorDescription}</p>
          </CardContent>
        )}
        <CardFooter className="flex flex-col gap-1">
          <div className="flex w-full gap-1">
            <Button variant="secondary" asChild className="flex-1">
              <Link href={AUTH_URLS.SIGN_IN}>
                <HomeIcon />
                Sign In
              </Link>
            </Button>
            <Button variant="secondary" asChild className="flex-1">
              <Link href={PROTECTED_URLS.DASHBOARD}>
                <GridIcon />
                Dashboard
              </Link>
            </Button>
          </div>
          <Button variant="secondary" asChild className="w-full">
            <Link href="/">
              <ArrowLeftIcon />
              Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function humanizeError(error: string): string {
  return error
    .split(/[_-]+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ')
}
