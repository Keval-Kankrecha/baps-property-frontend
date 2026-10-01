export type YesNo = 'yes' | 'no' | '';

export interface AttachedFile {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export const MAX_FILES = 10;

/** 1 વાર (square yard) = 0.836127 sq. m. */
export const SQM_PER_VAR = 0.836127;

export function sqmToVar(sqm: number | null | undefined): number | null {
  return sqm == null || isNaN(sqm) ? null : Math.round((sqm / SQM_PER_VAR) * 100) / 100;
}

export interface Property {
  _id?: string;
  serialNo?: number | null;
  propertyId: string;
  comesUnder: string;
  village: string;
  taluka: string;
  district: string;
  surveyDetails: string;
  deedNo: string;
  deedDate: string | null;
  deedFiles: AttachedFile[];
  giverNameAddress: string;
  areaSqm: number | null;
  in712: YesNo;
  propertyCard: string;
  propertyCardFiles: AttachedFile[];
  assessment: string;
  assessmentFiles: AttachedFile[];
  villageForm2: string;
  purpose: string;
  isNA: YesNo;
  naAreaSqm: number | null;
  remarks: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PropertyPage {
  items: Property[];
  total: number;
  page: number;
  limit: number;
}

export interface PropertyFilters {
  districts: string[];
  talukas: string[];
  purposes: string[];
}

/** "Comes under" dropdown — add more mandirs here. */
export const COMES_UNDER_OPTIONS = ['અક્ષર મંદિર ગોંડલ', 'રાજકોટ મંદિર'];

export const PURPOSE_OPTIONS = ['મંદિર', 'સંત આશ્રમ', 'પ્રેમવતી', 'હૉલ', 'અન્ય'];
