'use client'
import { create } from 'zustand'
import { shallow } from 'zustand/shallow'
import { DuplicateMergeAnalysisResponse } from '../types'

type Actions = {
    init: (data: DuplicateMergeAnalysisResponse) => void
}

export const aiDecisionStore = create<DuplicateMergeAnalysisResponse & Actions>((set) => ({
    grouped: [],
    duplicateGroupsCount: 0,
    totalFound: 0,
    init(data) {
        set(data)
    },
}))

// ✅ Use stable selector + shallow comparison
export const useAIDecisionsGroups = () => aiDecisionStore(state => state.grouped)

export const useAIDecisionsDuplicateGroupsCount = () => aiDecisionStore(state => state.duplicateGroupsCount)

export const useAIDecisionsTotalFound = () => aiDecisionStore(state => state.totalFound)

export const useAIDecisionsInit = () => aiDecisionStore((state) => state.init)

export default aiDecisionStore