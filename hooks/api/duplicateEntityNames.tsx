import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { analyzeDuplicatedEntities, ApplyMergePayload, getDuplicateEntitiesByName, getDuplicateEntitiesDetailByName, naturalLanguageQuery, resolveDuplicates } from "../../services/getDuplicatesName"
import { Entity } from "../../types"


export const useGetDuplicateEntitiesByName = (type: number, fetch: boolean) => {
    return useQuery({
        queryKey: ["GET_DUPLICATE_NAMES", type],
        queryFn: async () => {
            const response = await getDuplicateEntitiesByName(type)
            if (!response.success) {
                throw new Error(response.message)
            }
            return response.data!
        },
        enabled: fetch
    })
}

export const useGetDuplicateEntitiesDetailByName = (name: string, type: number, fetch: boolean) => {
    return useQuery({
        queryKey: ["GET_DUPLICATE_ENTITIES", name, type],
        queryFn: async () => {
            const response = await getDuplicateEntitiesDetailByName(name, type)
            if (!response.success) {
                throw new Error(response.message)
            }
            return response.data!
        },
        enabled: fetch
    })
}

export const useAnalyzeDuplicatedEntities = () => {
    return useMutation({
        mutationKey: ["ANALYZE_DUPLICATES"],
        mutationFn: async (payload: Entity[]) => {
            const response = await analyzeDuplicatedEntities(payload)
            if (!response.success) {
                throw new Error(response.message)
            }
            return response.data!
        },
    })
}

export const useResolveDuplicates = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ["RESOLVE_DUPLICATES"],
        mutationFn: async (payload: ApplyMergePayload) => {
            const response = await resolveDuplicates(payload)
            if (!response.success) {
                throw new Error(response.message)
            }
            return response.data!
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["GET_DUPLICATE_NAMES", "GET_DUPLICATE_ENTITIES"]
            })
        }
    })
}

export const useAskAI = () => {
    return useMutation({
        mutationKey: ["ASK_AI"],
        mutationFn: async (question: string) => {
            const response = await naturalLanguageQuery(question)
            if (!response.success) {
                throw new Error(response.message)
            }
            return response.data!
        },
    })
}

