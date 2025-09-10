"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Users, Building2, RefreshCwIcon } from "lucide-react"
import { useState, useMemo } from "react"
import { useGetDuplicateEntitiesByName } from "../../hooks/api/duplicateEntityNames"
import { useRouter } from "next/navigation"
import ErrorDisplay from "@/components/custom/ErrorDisplay"
import { useEntityType, useSetEntityType } from "@/stores/entityType.store"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/custom/PageHeader"

const OPTIONS = [
  {
    label: "Organizations",
    value: "1",
    icon: Building2,
  },
  {
    label: "People",
    value: "2",
    icon: Users,
  },
]

export default function Home() {
  const entityType = useEntityType()
  const setEntityType = useSetEntityType()
  const [searchTerm, setSearchTerm] = useState("")
  const query = useGetDuplicateEntitiesByName(+entityType, +entityType !== 0)
  const router = useRouter()

  // Derived states
  const typeLabel = entityType === "1" ? "Organizations" : "People"
  const Icon = entityType === "1" ? Building2 : Users

  const filteredAndGroupedData = useMemo(() => {
    if (!query.data) return {}

    const filtered = query.data
      .filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()))

    const grouped = filtered.reduce((acc, name) => {
      const firstLetter = name.charAt(0).toUpperCase()
      acc[firstLetter] = acc[firstLetter] || []
      acc[firstLetter].push(name)
      return acc
    }, {} as Record<string, string[]>)

    // Sort alphabetically
    return Object.keys(grouped)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = grouped[key].sort()
        return sorted
      }, {} as Record<string, string[]>)
  }, [query.data, searchTerm])

  const totalResults = Object.values(filteredAndGroupedData).flat().length

  return (
    <main className="min-h-screen bg-background">
      <PageHeader
        title="Duplicate Entries"
        description={`Detect and resolve duplicate ${typeLabel.toLowerCase()} with AI-powered matching`}
      />

      <div className="pl-2 pr-6 mx-auto py-8">
        {/* Search & Filter Section */}
        <section className="mb-8 max-w-xl flex flex-nowrap gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${typeLabel.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 w-full text-base rounded-full border-border border-2  focus:outline-none focus-visible:border-primary"
            />

            <div className="absolute top-1/2 right-2 -translate-y-1/2">
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger className="h-12 cursor-pointer bg-background border-none shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                      <div className="flex items-center gap-3">
                        <option.icon className="h-4 w-4 text-muted-foreground" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            size="icon"
            variant="default"
            disabled={query.isPending}
            onClick={() => query.refetch()}
            aria-label="Refresh data"
          >
            <RefreshCwIcon className={cn("h-5 w-5", query.isPending && "animate-spin")} />
          </Button>

        </section>

        {/* Results Section */}
        <Card className="rounded-md shadow-none">
          <CardHeader className="pb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle className="text-xl font-semibold text-foreground">
                Duplicate {typeLabel}
              </CardTitle>
              {query.data && (
                <Badge variant="secondary" className="text-sm px-3 py-1.5 font-medium">
                  {totalResults} found
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {/* Loading State */}
            {query.isLoading && (
              <div className="space-y-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-5 w-20 rounded-lg" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <Skeleton key={j} className="h-12 rounded-lg" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {query.isError && (
              <ErrorDisplay message={query.error?.message || "Failed to load duplicate entries"} />
            )}

            {/* No Results State */}
            {query.data && totalResults === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
                  <Icon className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No duplicates found</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Great! No duplicate {typeLabel.toLowerCase()} detected in your database.
                </p>
              </div>
            )}

            {/* Results */}
            {query.data && totalResults > 0 && (
              <ScrollArea className="h-[600px] pr-2">
                <div className="space-y-10">
                  {Object.entries(filteredAndGroupedData).map(([letter, names]) => (
                    <div key={letter}>
                      <div className="flex items-center gap-4 mb-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                          {letter}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{letter}</h3>
                        <Badge variant="outline" className="text-xs px-2.5">
                          {names.length}
                        </Badge>
                        <Separator className="flex-1" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ml-14">
                        {names.map((name, index) => (
                          <Button
                            key={`${name}-${index}`}
                            variant="ghost"
                            className="h-auto py-4 px-5 text-left justify-start hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-lg border border-transparent hover:border-border text-sm font-medium"
                            onClick={() =>
                              router.push(`/dashboard/duplicates/${encodeURIComponent(name)}?type=${entityType}`)
                            }
                          >
                            <span className="truncate w-full">{name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}