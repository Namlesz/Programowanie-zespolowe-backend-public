import {ObjectId} from "mongodb";

export interface noteReport {
    _id?: ObjectId;
    noteId: string;
    reason: string;
    description?: string;
}

export interface appReport {
    _id?: ObjectId;
    type: string;
    timestamp: string;
    description: string;
}

export function toNoteReport(json: any): noteReport | null {
    if (!("reason" in json) || !("noteId" in json))
        return null;
    else return json as noteReport;
}

export function toAppReport(json: any): appReport | null {
    if (!("type" in json) || !("description" in json))
        return null;
    else return json as appReport;
}