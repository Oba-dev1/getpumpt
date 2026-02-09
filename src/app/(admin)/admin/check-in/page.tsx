'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, UserCheck, Clock, AlertTriangle } from 'lucide-react'
import {
  searchMembersForCheckIn,
  checkInMember,
  getRecentCheckIns,
} from '@/lib/actions/check-in'
import { toast } from 'sonner'

export default function CheckInPage() {
  const sessionData = useSession()
  const session = sessionData?.data
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [loadingRecent, setLoadingRecent] = useState(true)
  const [checkingIn, setCheckingIn] = useState<string | null>(null)

  const gymId = session?.user?.gymId

  const fetchRecentCheckIns = useCallback(async () => {
    if (!gymId) return
    setLoadingRecent(true)
    try {
      const result = await getRecentCheckIns(gymId)
      setRecentCheckIns(result)
    } catch {
      toast.error('Failed to load recent check-ins')
    } finally {
      setLoadingRecent(false)
    }
  }, [gymId])

  useEffect(() => {
    fetchRecentCheckIns()
  }, [fetchRecentCheckIns])

  useEffect(() => {
    if (!gymId || query.trim().length < 2) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await searchMembersForCheckIn(gymId, query.trim())
        setSearchResults(results)
      } catch {
        toast.error('Search failed')
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [gymId, query])

  const handleCheckIn = async (userId: string) => {
    if (!gymId) return

    setCheckingIn(userId)
    try {
      const result = await checkInMember(gymId, { userId })
      toast.success(`${result.memberName} checked in successfully`)
      setSearchResults((prev) =>
        prev.filter((m) => m.id !== userId)
      )
      await fetchRecentCheckIns()
    } catch (error: any) {
      toast.error(error.message || 'Failed to check in member')
    } finally {
      setCheckingIn(null)
    }
  }

  const getMembershipBadge = (membership: any) => {
    if (!membership) {
      return <Badge variant="outline" className="text-gray-500">No Plan</Badge>
    }

    const now = new Date()
    const endDate = new Date(membership.endDate)
    const daysUntilExpiry = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (membership.status === 'EXPIRED' || daysUntilExpiry < 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Expired
        </Badge>
      )
    }

    if (daysUntilExpiry <= 7) {
      return (
        <Badge className="gap-1 bg-amber-500/20 text-amber-400 border-amber-500/30">
          <AlertTriangle className="h-3 w-3" />
          Expires in {daysUntilExpiry}d
        </Badge>
      )
    }

    if (membership.status === 'ACTIVE') {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
          Active
        </Badge>
      )
    }

    return (
      <Badge variant="secondary">{membership.status}</Badge>
    )
  }

  if (!gymId) {
    return null
  }

  return (
    <main className="space-y-6" aria-labelledby="checkin-title">
      <div>
        <h1 id="checkin-title" className="text-2xl font-semibold tracking-tight text-gray-900">
          Member Check-In
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Search for a member by name, email, or phone to check them in.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 text-base"
              autoFocus
            />
          </div>

          {searching && (
            <div className="mt-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searching && searchResults.length > 0 && (
            <div className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200">
              {searchResults.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0">
                      {member.avatar ? (
                        <AvatarImage src={member.avatar} alt="" />
                      ) : null}
                      <AvatarFallback>
                        {member.firstName?.[0]}
                        {member.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {member.email}
                        {member.phone ? ` | ${member.phone}` : ''}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        {getMembershipBadge(member.membership)}
                        {member.membership?.plan?.name && (
                          <span className="text-xs text-gray-500">
                            {member.membership.plan.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="gym"
                    size="sm"
                    onClick={() => handleCheckIn(member.id)}
                    disabled={checkingIn === member.id}
                    className="shrink-0"
                  >
                    <UserCheck className="h-4 w-4" />
                    {checkingIn === member.id ? 'Checking in...' : 'Check In'}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!searching && query.trim().length >= 2 && searchResults.length === 0 && (
            <div className="mt-4 rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-600">No members found matching "{query}"</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Check-Ins
            {!loadingRecent && (
              <Badge variant="secondary" className="ml-2">
                {recentCheckIns.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRecent ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : recentCheckIns.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-600">No check-ins yet today</p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200">
              <Table>
                <caption className="sr-only">Today's member check-ins</caption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Member</TableHead>
                    <TableHead scope="col">Plan</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col">Checked In By</TableHead>
                    <TableHead scope="col">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCheckIns.map((checkIn) => (
                    <TableRow key={checkIn.id}>
                      <TableCell className="font-medium text-gray-900">
                        {checkIn.user.firstName} {checkIn.user.lastName}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {checkIn.user.membership?.plan?.name ?? '-'}
                      </TableCell>
                      <TableCell>
                        {getMembershipBadge(checkIn.user.membership)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {checkIn.staff.firstName} {checkIn.staff.lastName}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {new Date(checkIn.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
