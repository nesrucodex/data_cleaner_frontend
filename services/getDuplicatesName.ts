"use server"

import { AxiosError } from "axios";
import { Address, APIResponse, DuplicateMergeAnalysisResponse, Entity, EntityProperty, Person } from "../types";
import axiosClient from "@/lib/axiosClient";

type ServerActionResponse<T> = {
  success: boolean,
  message: string,
  data: T
}

export const getDuplicateEntitiesByName = async (type: number): Promise<ServerActionResponse<string[] | null>> => {
  try {
    const response = await axiosClient.get<APIResponse<string[]>>(
      `/cleanup/entities/similar/by-name/${type}`
    );
    const data = response.data.data || []
    return {
      success: true,
      data,
      message: ""
    }
  } catch (error) {
    const msg = getServerResponseErrorMsg(error);
    return {
      success: false,
      message: msg,
      data: null
    }
  }
};
export const getDuplicateEntitiesDetailByName = async (name: string, type: number): Promise<ServerActionResponse<{ entities: Entity[] } | null>> => {
  try {
    const response = await axiosClient.get<APIResponse<{ entities: Entity[] } | null>>(
      `/cleanup/entities/by-name/${name}?type=${type}`
    );
    const data = response.data.data
    return {
      success: true,
      data: data || null,
      message: ""
    }
  } catch (error) {
    const msg = getServerResponseErrorMsg(error);
    return {
      success: false,
      message: msg,
      data: null
    }
  }
};

export const analyzeDuplicatedEntities = async (payload: Entity[]): Promise<ServerActionResponse<DuplicateMergeAnalysisResponse | null>> => {
  try {
    const response = await axiosClient.post<APIResponse<DuplicateMergeAnalysisResponse>>(
      `/cleanup/entities/duplicates/analyze`,
      payload
    );
    const data = response.data.data
    return {
      success: true,
      data: data || null,
      message: ""
    }
  } catch (error) {
    const msg = getServerResponseErrorMsg(error);
    return {
      success: false,
      message: msg,
      data: null
    }
  }
};

export type ApplyMergePayload = {
  keep_entity_id: number;
  remove_entity_ids: number[];
  merged_entity: {
    name?: string;
    trade_name?: string | null;
    people: Array<Omit<Person, "entity_id">>;
    address: Array<Omit<Address, "entity_id">>;
    entity_property_entity_property_entity_idToentity: Array<Omit<EntityProperty, "entity_id">>;
  };
}


export const resolveDuplicates = async (payload: ApplyMergePayload): Promise<ServerActionResponse<DuplicateMergeAnalysisResponse | null>> => {
  try {
    const response = await axiosClient.post<APIResponse<DuplicateMergeAnalysisResponse>>(
      `/cleanup/entities/resolve-duplicates`,
      payload
    );
    const data = response.data.data
    return {
      success: true,
      data: data || null,
      message: ""
    }
  } catch (error) {
    const msg = getServerResponseErrorMsg(error);
    return {
      success: false,
      message: msg,
      data: null
    }
  }
};

// type QueryResponse = {
//   message: string
//   data: {
//     question: string
//     explanation: string
//     sql: string
//     results: Record<string, unknown>[]
//     intent: unknown
//   }
// }

// export const naturalLanguageQuery = async (question: string): Promise<ServerActionResponse<QueryResponse | null>> => {
//   try {
//     const response = await axiosClient.post<APIResponse<QueryResponse>>(
//       `/natural-query`,
//       { question }
//     );

//     const data = response.data?.data

//     return {
//       success: true,
//       message: "",
//       data: data || null
//     }
//   } catch (error) {
//     const msg = getServerResponseErrorMsg(error);
//     return {
//       success: false,
//       message: msg,
//       data: null
//     }
//   }
// };

// Backend now returns this shape:
export type MarkdownResponse = {
  markdown: string;
};


// Server action response wrapper
export const naturalLanguageQuery = async (
  question: string
): Promise<ServerActionResponse<MarkdownResponse | null>> => {
  try {
    const response = await axiosClient.post<APIResponse<MarkdownResponse>>(
      `/natural-query`,
      { question }
    );

    const data = response.data?.data;

    // Validate data shape
    if (!data || typeof data.markdown !== "string") {
      throw new Error("Invalid response format: missing markdown field");
    }

    return {
      success: true,
      message: response.data.message || "",
      data: data, // { markdown: "..." }
    };
  } catch (error) {
    const msg = getServerResponseErrorMsg(error);
    return {
      success: false,
      message: msg,
      data: null,
    };
  }
};

const getServerResponseErrorMsg = (error: unknown) => {
  const message = "";
  if (error instanceof AxiosError) {
    if (error.response?.data?.message) {
      return error.response?.data?.message;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return message;
};
