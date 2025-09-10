import { DateTime } from "../types";

export function formatDate(date: DateTime, options?: Intl.DateTimeFormatOptions): string {
    if (!date) return "-"; // Handle null or undefined

    let parsedDate: Date;

    if (typeof date === "string" || date instanceof Date) {
        parsedDate = new Date(date);
    } else if (typeof date === "object" && "toString" in date) {
        parsedDate = new Date(date.toString());
    } else {
        return "-";
    }

    if (isNaN(parsedDate.getTime())) return "-"; // Invalid date

    // Default formatting if options not provided
    const formatOptions: Intl.DateTimeFormatOptions = options || {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    };

    return parsedDate.toLocaleString(undefined, formatOptions);
}
