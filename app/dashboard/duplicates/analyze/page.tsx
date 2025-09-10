"use client"

import {
  Brain,
  Building2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Merge,
  Database,
  Users,
  Phone,
  User,
  Shield,
  Zap,
  AlertTriangleIcon,
  MergeIcon,
  XIcon,
  InfoIcon,
} from "lucide-react"
import {
  useAIDecisionsGroups,
  useAIDecisionsDuplicateGroupsCount,
  useAIDecisionsTotalFound,
} from "../../../../stores/aiDecision"

// shadcn/ui components
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { useResolveDuplicates } from "@/hooks/api/duplicateEntityNames"
import { toast } from "sonner"
import { PageHeader } from "@/components/custom/PageHeader"
import { Spinner } from "@/components/custom/Spinner"
import { DialogProps } from "@radix-ui/react-dialog"
import DisplayJSON from "@/components/custom/DisplayJSON"

const AIDecisionPage = () => {
  const aiDecisionGroups = useAIDecisionsGroups()
  const aiDecisionsDuplicateGroupsCount = useAIDecisionsDuplicateGroupsCount()
  const aiDecisionsTotalFound = useAIDecisionsTotalFound()
  const resolveDuplicatesMutation = useResolveDuplicates()

  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false)

  const needsReviewCount = aiDecisionGroups.filter((group) => group.aiDecision?.needsReview).length || 0
  const autoMergeCount = (aiDecisionGroups.length || 0) - needsReviewCount

  const applyMerge = async () => {
    const promises = aiDecisionGroups.map((g) => {
      resolveDuplicatesMutation.mutateAsync({
        keep_entity_id: +g.aiDecision.keep,
        merged_entity: g.mergedEntity,
        remove_entity_ids: g.aiDecision.remove.map((id) => +id),
      })
    })

    await Promise.all(promises)
  }

  useEffect(() => {
    if (resolveDuplicatesMutation.isSuccess) {
      toast.success("Merge applied successfully")
    }
  }, [resolveDuplicatesMutation.isSuccess])

  useEffect(() => {
    if (resolveDuplicatesMutation.isError) {
      toast.error(resolveDuplicatesMutation.error.message || "Error occured while merging confilicts.")
    }
  }, [resolveDuplicatesMutation.error?.message, resolveDuplicatesMutation.isError])

  return (
    <div className="min-h-screen">
      <MergeWarningDialog
        open={isWarningDialogOpen}
        onConfirm={() => {
          applyMerge()
        }}
        onOpenChange={setIsWarningDialogOpen}
      />


      {/* <DisplayJSON data={{ aiDecisionGroups }} /> */}

      {/* Resolving */}
      <MergingPendingModal open={resolveDuplicatesMutation.isPending}
        onOpenChange={setIsWarningDialogOpen} />

      <PageHeader
        showBack
        title="AI Duplicate Analysi"
        description="Intelligent entity deduplication and merge recommendations"
      />

      <div className=" mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          <Card className="bg-white border rounded-md shadow-none hover:shadow-sm transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Entities</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{aiDecisionsTotalFound || 0}</p>
                  <p className="text-xs text-gray-500 mt-2">Analyzed for duplicates</p>
                </div>
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-blue-50">
                  <Database className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border rounded-md shadow-none hover:shadow-sm transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Needs Review</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{needsReviewCount}</p>
                  <p className="text-xs text-gray-500 mt-2">Manual verification required</p>
                </div>
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-amber-50">
                  <AlertTriangle className="w-7 h-7 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border rounded-md shadow-none hover:shadow-sm transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Duplicate Groups</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{aiDecisionsDuplicateGroupsCount || 0}</p>
                  <p className="text-xs text-gray-500 mt-2">Identified clusters</p>
                </div>
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-green-50">
                  <Merge className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-8">
          {!aiDecisionGroups || aiDecisionGroups.length === 0 ? (
            <Card className="bg-white border rounded-none shadow-none">
              <CardContent className="text-center py-20">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mx-auto mb-6">
                  <Database className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Duplicate Groups Found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  All entities appear to be unique. No merge actions required at this time.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {aiDecisionGroups.map((group, index) => (
                <Card
                  key={index}
                  className="bg-white border rounded-none shadow-none transition-shadow overflow-hidden"
                >
                  <CardHeader className="pb-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div
                          className={`flex items-center justify-center w-14 h-14 rounded-xl ${group.aiDecision?.needsReview
                            ? "bg-amber-100 border-2 border-amber-200"
                            : "bg-green-100 border-2 border-green-200"
                            }`}
                        >
                          {group.aiDecision?.needsReview ? (
                            <AlertTriangle className="w-7 h-7 text-amber-600" />
                          ) : (
                            <CheckCircle className="w-7 h-7 text-green-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">Duplicate Group {index + 1}</h3>
                          <div className="flex items-center gap-3 mt-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700 font-medium">
                              {group.mergedEntity?.name || "Unknown Entity"}
                            </span>
                            {group.mergedEntity?.type && (
                              <Badge variant="outline" className="ml-2 bg-white border-gray-300">
                                {group.mergedEntity.type === 1 ? (
                                  <>
                                    <Building2 className="w-3 h-3 mr-1" />
                                    Organization
                                  </>
                                ) : (
                                  <>
                                    <User className="w-3 h-3 mr-1" />
                                    Person
                                  </>
                                )}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={group.aiDecision?.needsReview ? "destructive" : "default"}
                          className={
                            group.aiDecision?.needsReview
                              ? "bg-amber-100 text-amber-800 border-amber-300 px-4 py-2"
                              : "bg-green-100 text-green-800 border-green-300 px-4 py-2"
                          }
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          {group.aiDecision?.needsReview ? "Manual Review" : "Auto-Merge"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-8 space-y-8">
                    <section className="space-y-6">
                      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50">
                          <Brain className="w-5 h-5 text-blue-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">AI Decision Analysis</h4>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-3">Retained Entity</p>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-2">
                              <Shield className="w-4 h-4 mr-2" />
                              ID: {group.aiDecision.keep}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-3">Entities to Remove</p>
                            <div className="flex flex-wrap gap-2">
                              {group.aiDecision.remove.map((id) => (
                                <Badge
                                  key={id}
                                  variant="outline"
                                  className="bg-red-50 text-red-700 border-red-200 px-3 py-2"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  ID: {id}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-3">AI Reasoning</p>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm leading-relaxed text-gray-700">{group.aiDecision.suggestions}</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6">
                      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-50">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Entity Details & Properties</h4>
                      </div>

                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-600">Entity ID</p>
                          <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded-md border">
                            {group.mergedEntity.entity_id}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-600">Name</p>
                          <p className="text-sm font-semibold text-gray-900">{group.mergedEntity.name}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-600">Trade Name</p>
                          <p className="text-sm text-gray-700">{group.mergedEntity.trade_name || "Not specified"}</p>
                        </div>
                      </div>

                      {group.mergedEntity.address.length > 0 &&
                        <section>
                          <Separator className="bg-gray-200 mb-4" />
                          <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <InfoIcon className="w-4 h-4" />
                            Entity Addresses
                          </h5>


                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {group.mergedEntity.address.map((addr) => (
                              <div
                                key={addr.address_id}
                                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                              >
                                {/* Address Line */}
                                <p className="font-mono text-sm text-gray-900 mb-2">{addr.line_one}</p>
                                {addr.line_two && (
                                  <p className="font-mono text-sm text-gray-900 mb-2">{addr.line_two}</p>
                                )}

                                {/* City */}
                                {addr.city && (
                                  <p className="text-xs text-gray-600">
                                    <span className="font-medium text-gray-700">City:</span> {addr.city}
                                  </p>
                                )}

                                {/* Country (always exists) */}
                                <p className="text-xs text-gray-600">
                                  <span className="font-medium text-gray-700">Country:</span> {addr.country}
                                </p>
                              </div>
                            ))}
                          </div>

                        </section>

                      }
                      <Separator className="bg-gray-200" />

                      {/* Contact Information */}
                      {group.mergedEntity.entity_property_entity_property_entity_idToentity &&
                        group.mergedEntity.entity_property_entity_property_entity_idToentity.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <InfoIcon className="w-4 h-4" />
                              Entity Properties
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {group.mergedEntity.entity_property_entity_property_entity_idToentity.map(
                                (property, idx) => (
                                  <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <Badge
                                        variant="outline"
                                        className={
                                          property.is_primary === "Yes"
                                            ? "bg-blue-50 text-blue-700 border-blue-200"
                                            : "bg-gray-100 text-gray-600 border-gray-300"
                                        }
                                      >
                                        {property.property_title}
                                      </Badge>
                                      {property.is_primary === "Yes" && (
                                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                          Primary
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="font-mono text-sm text-gray-900 mb-2">{property.property_value}</p>
                                    <p className="text-xs text-gray-500">
                                      Type: {property.property_id.replace("_", " ")}
                                    </p>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      {/* People Information */}
                      {group.mergedEntity.people && group.mergedEntity.people.length > 0 && (
                        <>
                          <Separator className="bg-gray-200" />
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Associated People
                            </h5>
                            <div className="space-y-3">
                              {group.mergedEntity.people.map((person, idx) => (
                                <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-semibold text-gray-900">
                                        {person.first_name} {person.last_name}
                                      </p>
                                      {person.title && <p className="text-sm text-gray-600 mt-1">{person.title}</p>}
                                    </div>
                                    <Badge variant="outline" className="font-mono text-xs bg-white border-gray-300">
                                      ID: {person.people_id}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </section>

                    <section className="space-y-6">
                      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50">
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">Cleanup & Deletion Plan</h4>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-3">Retained Entity</p>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-green-700 border-green-300 px-3 py-2"
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                ID: {group.deletionPlan.retained_entity_id}
                              </Badge>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-3">Entities to Delete</p>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <div className="flex flex-wrap gap-2">
                                {group.deletionPlan.deleted_entity_ids.map((id) => (
                                  <Badge
                                    key={id}
                                    variant="outline"
                                    className="bg-red-100 text-red-700 border-red-300 px-3 py-2"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    ID: {id}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-3">Database Cleanup Tasks</p>
                          <div className="space-y-3">
                            {Object.entries(group.deletionPlan.tables_to_cleanup).map(([table, ids]) => (
                              <div key={table} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-sm capitalize text-gray-900">{table}</span>
                                  <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700">
                                    {Array.isArray(ids) ? ids.length : 1} records
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 font-mono">
                                  IDs: {Array.isArray(ids) ? ids.join(", ") : ids}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>

                    <Separator className="bg-gray-200" />

                    <section className="flex items-center justify-end gap-4 pt-4">
                      <Button
                        size="lg"
                        className="px-8 py-3 flex items-center gap-2 rounded-md shadow-none"
                        onClick={() => {
                          if (aiDecisionGroups[0].aiDecision.needsReview) {
                            setIsWarningDialogOpen(true)
                            return
                          }
                          applyMerge()
                        }}
                        disabled={resolveDuplicatesMutation.isPending}
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve Auto-Merge
                      </Button>
                    </section>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

interface MergeWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  entityName?: string
  conflictCount?: number
}

function MergeWarningDialog({
  open,
  onOpenChange,
  onConfirm,
  entityName = "entities",
  conflictCount = 0,
}: MergeWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-left">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border-2 border-amber-200">
              <AlertTriangleIcon className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-gray-900">Confirm Merge Operation</DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">This action cannot be undone</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MergeIcon className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 mb-2">Merge Requires Review</h4>
                <p className="text-sm text-amber-800">
                  You are about to merge <span className="font-semibold">{entityName}</span>
                  {conflictCount > 0 && (
                    <span>
                      {" "}
                      with <span className="font-semibold">{conflictCount} detected conflicts</span>
                    </span>
                  )}
                  . Please ensure you have reviewed all data before proceeding.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">What happens next:</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0" />
                Duplicate entities will be consolidated
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0" />
                Conflicting data will be resolved automatically
              </li>
              {/* <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0" />
                Original records will be archived
              </li> */}
            </ul>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="sm:w-auto w-full border-gray-300">
            <XIcon className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className="sm:w-auto w-full"
          >
            <MergeIcon className="h-4 w-4" />
            Apply Merge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MergingPendingModal({
  open,
  onOpenChange,
}: DialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-none" showCloseButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle />
        </DialogHeader>

        <div>
          <Spinner size={"lg"} label="Merging..." />
        </div>

      </DialogContent>
    </Dialog>
  )
}

export default AIDecisionPage
