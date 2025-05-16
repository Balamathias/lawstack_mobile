export interface CaseTag {
  id: string;
  name: string;
  slug: string;
}

export interface Case {
  id: string;
  title: string;
  court: string | null;
  year: number | null;
  jurisdiction: string | null;
  summary: string | null;
  facts: string | null;
  issues: string | null;
  holding: string | null;
  tags: CaseTag[];
  tag_ids?: string[];
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published' | 'archived' | 'under_review';
  version: number;
  previous_version: string | null;
  attachments: string | null; // Comma-separated file URLs/paths
  evidence: string | null;    // Comma-separated file URLs/paths
  notes: string | null;       // User notes or annotations (JSON or text)
  citations: string | null;   // Comma-separated case IDs or references
  analytics: string | null;   // Analytics data (JSON string)
}

export interface CaseHistory {
  id: string;
  version: number;
  previous_version: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseBulkStatusUpdate {
  ids: string[];
  status: 'draft' | 'published' | 'archived' | 'under_review';
}

export interface CaseNote {
  note: string;
}

export interface CaseAttachment {
  file_url: string;
}

export interface CaseCitation {
  citation: string;
}

export interface CaseAnalytics {
  analytics: string;
}
