import Link from 'next/link'

export default function Page() {
  return (
    <div className="min-h-screen gradient-primary flex flex-col items-center justify-center p-8 text-center">
      <Link href="/auth/login" className="btn btn-primary">
        Sign In
      </Link>
      <Link href="/auth/register" className="btn btn-secondary mt-4">
        Register
      </Link>
    </div>
  )
}
