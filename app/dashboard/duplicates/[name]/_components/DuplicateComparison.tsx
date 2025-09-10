"use client"

import type React from "react"
import {
  Building2,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  OptionIcon,
  InfoIcon,
  DiffIcon,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Entity } from "@/types"

interface DuplicateComparisonProps {
  entities: Entity[]
  searchTerm?: string
}

interface ComparisonFieldProps {
  label: string
  values: (string | null)[]
  icon?: React.ReactNode
  searchTerm?: string
}

const Highlight: React.FC<{ highlight: string; children: string }> = ({ highlight, children }) => {
  if (!highlight || !children) return <>{children}</>
  const regex = new RegExp(`(${highlight})`, "gi")
  const parts = children.split(regex)
  return (
    <>
      {parts.filter(String).map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-primary/20 text-primary rounded px-1.5 py-0.5 font-medium"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

const ComparisonField = ({ label, values, icon, searchTerm = "" }: ComparisonFieldProps) => {
  const hasConflict = values.some((val, idx) =>
    values.some((otherVal, otherIdx) => idx !== otherIdx && val !== otherVal && val && otherVal),
  )

  const allEmpty = values.every((val) => !val)
  const allSame = !hasConflict && !allEmpty

  return (
    <div className="mb-6">
      {/* Field Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {hasConflict && (
            <Badge variant="destructive" className="gap-1 text-xs px-2 py-1">
              <XCircle className="h-3 w-3" />
              Conflict
            </Badge>
          )}
          {allSame && (
            <Badge variant="default" className="gap-1 text-xs px-2 py-1 bg-green-500 text-white">
              <CheckCircle className="h-3 w-3" />
              Match
            </Badge>
          )}
          {allEmpty && (
            <Badge variant="outline" className="gap-1 text-xs px-2 py-1 text-muted-foreground">
              <AlertTriangle className="h-3 w-3" />
              Missing
            </Badge>
          )}
        </div>
      </div>

      {/* Value Grid */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${values.length}, 1fr)`,
        }}
      >
        {values.map((value, index) => (
          <div
            key={index}
            className={cn(
              "p-4 rounded-lg text-sm border transition-all",
              value ? "text-foreground font-medium" : "text-muted-foreground",
              hasConflict
                ? "bg-destructive/5 border-destructive/30"
                : allSame
                  ? "bg-success/5 border-success/30"
                  : "bg-muted border-border"
            )}
          >
            {value ? (
              searchTerm ? (
                <Highlight highlight={searchTerm}>{value}</Highlight>
              ) : (
                value
              )
            ) : (
              <span className="italic">Not provided</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DuplicateComparison({ entities, searchTerm = "" }: DuplicateComparisonProps) {
  if (!entities || entities.length === 0) {
    return (
      <Card className="p-8 shadow-none rounded-md text-center border ">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-muted-foreground">No entities to compare</h3>
        <p className="text-sm text-muted-foreground/80 mt-1">Please select entities to begin comparison</p>
      </Card>
    )
  }

  const formatDate = (date: unknown) => {
    if (!date) return null
    try {
      return new Date(date as string).toLocaleDateString()
    } catch {
      return "Invalid Date"
    }
  }

  const getEntityTypeLabel = (type: number) => {
    return type === 1 ? "Organization" : type === 2 ? "Person" : "Unknown"
  }

  // Conflict Detection
  const conflictStats = {
    total: 0,
    phoneConflicts: 0,
    emailConflicts: 0,
    addressConflicts: 0,
    nameConflicts: 0,
  }

  if (entities.length > 1) {
    const names = entities.map((e) => e.name)
    if (new Set(names).size > 1) conflictStats.nameConflicts++

    const allPhones = entities.map(
      (e) =>
        e.entity_property_entity_property_entity_idToentity
          ?.filter((p) => p.property_id === "phone_number")
          .map((p) => p.property_value) || [],
    )
    if (
      allPhones.some((phones, idx) =>
        allPhones.some(
          (otherPhones, otherIdx) => idx !== otherIdx && phones.some((phone) => !otherPhones.includes(phone)),
        ),
      )
    ) {
      conflictStats.phoneConflicts++
    }

    conflictStats.total = Object.values(conflictStats).reduce((a, b) => a + b, 0) - conflictStats.total
  }

  return (
    <div className="space-y-8 grid lg:grid-cols-2 gap-4 w-[200%] sm:w-full overflow-x-scroll items-start">
      {/* Header Card */}
      <Card className={cn("border shadow-none rounded-md", {
        "col-span-2": entities.length >= 3
      })}>
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-semibold text-foreground">Entity Comparison</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-sm px-3 py-1.5">
                {entities.length} entity{entities.length !== 1 ? "ies" : ""}
              </Badge>
              {conflictStats.total > 0 && (
                <Badge variant="destructive" className="gap-1 px-3 py-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  {conflictStats.total} conflict{conflictStats.total !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>

          <div
            className="grid gap-6 overflow-x-scroll p-2"
            style={{
              gridTemplateColumns: `repeat(${entities.length}, 1fr)`,
            }}
          >
            {entities.map((entity, index) => (
              <div key={entity.entity_id} className="relative">
                <div className="p-6 border rounded-lg bg-card">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${entity.type === 1 ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                        }`}
                    >
                      {entity.type === 1 ? (
                        <Building2 className="h-5 w-5" />
                      ) : (
                        <Users className="h-5 w-5" />
                      )}
                    </div>
                    <h4 className="font-semibold  mb-2 text-foreground">
                      {entity.name}
                    </h4>
                    <Badge
                      className={
                        entity.type === 1
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-green-100 text-green-800 border-green-200"
                      }
                    >
                      #{entity.entity_id}
                      {/* {getEntityTypeLabel(entity.type)} */}
                    </Badge>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-sm">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Basic Info Section */}
      <Card className={cn("border shadow-none rounded-md", {
        "col-span-2": entities.length >= 3
      })}>
      <div className="p-8">
        <h4 className="text-lg font-semibold mb-6 flex items-center gap-2 text-foreground">
          <InfoIcon className="h-5 w-5 text-primary" />
          Basic Information
        </h4>

        <ComparisonField
          label="Entity Name"
          values={entities.map((e) => e.name)}
          icon={<DiffIcon className="h-4 w-4 text-primary" />}
          searchTerm={searchTerm}
        />

        <ComparisonField
          label="Trade Name"
          values={entities.map((e) => e.trade_name)}
          icon={<DiffIcon className="h-4 w-4 text-primary" />}
          searchTerm={searchTerm}
        />

        <ComparisonField
          label="Entity Type"
          values={entities.map((e) => getEntityTypeLabel(e.type))}
          icon={<OptionIcon className="h-4 w-4 text-primary" />}
        />

        <ComparisonField
          label="Created Date"
          values={entities.map((e) => formatDate(e.created_at))}
          icon={<Calendar className="h-4 w-4 text-primary" />}
        />

        <ComparisonField
          label="Created By"
          values={entities.map((e) => (e.created_by ? `User ${e.created_by}` : null))}
          icon={<User className="h-4 w-4 text-primary" />}
        />
      </div>
    </Card>

      {/* Associated People */ }
  {
    entities.some((e) => e.people && e.people.length > 0) && (
      <Card className="border shadow-none rounded-md ">
        <div className="p-8">
          <h4 className="text-lg font-semibold mb-6 flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-primary" />
            Associated People
          </h4>

          <div
            className="grid gap-6 overflow-x-scroll p-2"
            style={{
              gridTemplateColumns: `repeat(${entities.length}, 1fr)`,
            }}
          >
            {entities.map((entity, index) => (
              <div key={entity.entity_id} className="p-6 bg-muted/50 rounded-md border">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <p className="font-medium text-foreground">Entity {index + 1}</p>
                </div>
                {entity.people && entity.people.length > 0 ? (
                  <div className="space-y-3">
                    {entity.people.map((person) => (
                      <div
                        key={person.people_id}
                        className="flex items-start gap-3 p-3 bg-background rounded-lg border"
                      >
                        <div className="p-1.5 bg-primary/10 rounded-full">
                          <User className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {person.salutation && `${person.salutation} `}
                            {person.first_name} {person.last_name}
                          </p>
                          {person.title && (
                            <p className="text-sm text-muted-foreground mt-1">{person.title}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">ID: {person.people_id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-70" />
                    <p className="text-sm text-muted-foreground">No people associated</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  {/* Addresses */ }
  {
    entities.some((e) => e.address && e.address.length > 0) && (
      <Card className="border shadow-none rounded-md ">
        <div className="p-8">
          <h4 className="text-lg font-semibold mb-6 flex items-center gap-2 text-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            Addresses
          </h4>

          <div
            className="grid gap-6 overflow-x-scroll p-2"
            style={{
              gridTemplateColumns: `repeat(${entities.length}, 1fr)`,
            }}
          >
            {entities.map((entity, index) => (
              <div
                key={entity.entity_id}
                className="p-6 bg-gradient-to-br from-secondary/10 to-muted/10 rounded-md border"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <p className="font-medium text-foreground">Entity {index + 1}</p>
                </div>
                {entity.address && entity.address.length > 0 ? (
                  <div className="space-y-3">
                    {entity.address.map((addr) => (
                      <div key={addr.address_id} className="flex gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm">
                            {addr.line_one}
                            {addr.line_two && `, ${addr.line_two}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {([addr.city, addr.state, addr.zipcode, addr.country] as string[])
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          {addr.address_type && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {addr.address_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-70" />
                    <p className="text-sm text-muted-foreground">No addresses</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  {/* Entity Properties (Email, Phone, etc.) */ }
  {
    entities.some(
      (e) =>
        e.entity_property_entity_property_entity_idToentity &&
        e.entity_property_entity_property_entity_idToentity.length > 0,
    ) && (
      <Card className={cn("border shadow-none rounded-md ", { "lg:col-span-2": entities.length >= 3 })}>
        <div className="p-8">
          <h4 className="text-lg font-semibold mb-6 flex items-center gap-2 text-foreground">
            <OptionIcon className="h-5 w-5 text-primary" />
            Entity Properties
          </h4>

          <div
            className="grid gap-6 overflow-x-auto p-2"
            style={{
              gridTemplateColumns: `repeat(${entities.length}, 1fr)`,
            }}
          >
            {entities.map((entity, index) => (
              <div
                key={entity.entity_id}
                className="p-6 bg-gradient-to-br from-secondary/10 to-muted/10 rounded-md border"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <p className="font-medium text-foreground">Entity {index + 1}</p>
                </div>
                {entity.entity_property_entity_property_entity_idToentity &&
                  entity.entity_property_entity_property_entity_idToentity.length > 0 ? (
                  <div className="space-y-3">
                    {entity.entity_property_entity_property_entity_idToentity.map((prop) => (
                      <div
                        key={prop.entity_property_id}
                        className="p-4 bg-background rounded-lg border overflow-auto max-h-40"
                        style={{ scrollbarWidth: "thin" }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 bg-primary/10 rounded-full">
                            {prop.property_id === "email" && (
                              <Mail className="h-3.5 w-3.5 text-primary" />
                            )}
                            {prop.property_id === "phone_number" && (
                              <Phone className="h-3.5 w-3.5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate text-sm">
                              {prop.property_value}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              <Badge variant="outline" className="text-xs px-2">
                                {prop.property_id.replace("_", " ")}
                              </Badge>
                              {prop.property_title && (
                                <Badge variant="secondary" className="text-xs px-2">
                                  {prop.property_title}
                                </Badge>
                              )}
                              {prop.is_primary === "Yes" && (
                                <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2">
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1.5">
                              Position: {prop.position} | ID: {prop.entity_property_id}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Phone className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-70" />
                    <p className="text-sm text-muted-foreground">No properties</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }
    </div >
  )
}