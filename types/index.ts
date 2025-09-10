export type APIResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
  error?: Error;
};

/**
 * Represents a generic timestamp. Could be string, Date, or null.
 * Adjust based on your actual date format (ISO string, number, etc.)
 */
export type DateTime = string | null | Record<string, any> // Adjust if you use `Date` objects

/**
 * Base Entity
 */
export interface Entity {
  entity_id: number
  type: number
  name: string
  trade_name: string | null
  creator_ledger_id: number
  computed_phones: any | null
  computed_addresses: any | null
  computed_emails: any | null
  prev_id: number | null
  created_by: number | null
  updated_by: number | null
  created_at: DateTime
  updated_at: DateTime
  deleted_at: DateTime
  is_deleted: boolean
  dups_ok: number
  people: Person[]
  address: Address[]
  entity_property_entity_property_entity_idToentity: EntityProperty[]
  entity_mapping_entity_mapping_entity_idToentity: EntityMapping[]
  entity_mapping_entity_mapping_parent_idToentity: EntityMapping[]
}

/**
 * Person (linked to entity)
 */
export interface Person {
  people_id: number
  entity_id: number
  type: number
  salutation: string | null
  first_name: string
  last_name: string
  title: string | null
  date_of_birth: string | null // ISO date string or null
  created_by: number
  updated_by: number
  created_at: DateTime
  updated_at: DateTime
  deleted_at: DateTime
}

/**
 * Address
 */
export interface Address {
  address_id: number
  entity_id: number
  line_one: string
  line_two: string | null
  area: string | null
  city: string | null
  state: string | null
  zipcode: string | null
  country: string
  country_code: string | null
  ref_id: string | null
  created_by: number | null
  updated_by: number | null
  created_at: DateTime
  updated_at: DateTime
  deleted_at: DateTime
  address_type: string | null
}

/**
 * Entity Property (custom fields like email, phone, CRM ID, etc.)
 */
export interface EntityProperty {
  entity_property_id: number
  entity_id: number
  parent_id: number | null
  property_id: string // e.g., "email", "phone_number", "crm_id"
  property_refid: string | null
  property_title: string | null // e.g., "Primary", "Office"
  property_value: string // Could be number/boolean in some cases, but mostly string
  is_primary: 'Yes' | 'No' // Literal union based on observed values
  position: number
  created_by: number | null
  updated_by: number | null
  created_at: DateTime
  updated_at: DateTime
}

/**
 * Entity Mapping (relationship between two entities)
 */
export interface EntityMapping {
  entity_mapping_id: number
  parent_id: number
  entity_id: number
  title: string | null
  is_primary: string | null // Seems optional, not consistently used
  created_at: DateTime
  updated_at: DateTime
  created_by: number
  updated_by: number
  deleted_at: DateTime
}


/**
 * AI Decision for merging duplicates
 */
export interface AIDecision {
  keep: string // ID of retained entity (string ID)
  remove: string[] // IDs of entities to be removed
  needsReview: boolean
  suggestions: string
  changes: Record<string, any> // Can be expanded if structured later
}

/**
 * Deletion Plan – tracks which records will be deleted per table
 */
export interface DeletionPlan {
  retained_entity_id: number
  deleted_entity_ids: number[]
  tables_to_cleanup: {
    entity: number[] // entity_id list
    entity_property: number[] // entity_property_id list
    address: number[] // address_id list
    // Add other tables as needed: phone, email, etc.
  }
}

/**
 * Merged Entity – the resulting entity after consolidation
 * Reuses existing `Entity` interface but with consolidated data
 */
export interface MergedEntity extends Entity {
  // All fields from Entity are inherited
  // You can add merge-specific overrides if needed, e.g.:
  // merge_conflicts?: Record<string, any>
}

/**
 * Grouped Merge Result – one group of duplicates processed
 */
export interface DuplicateGroup {
  aiDecision: AIDecision
  mergedEntity: MergedEntity
  deletionPlan: DeletionPlan
}

/**
 * Root Response for Duplicate Merge Analysis
 */
export interface DuplicateMergeAnalysisResponse {
  grouped: DuplicateGroup[]
  totalFound: number
  duplicateGroupsCount: number
}



