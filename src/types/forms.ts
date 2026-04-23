import type { Timestamp, FieldValue } from "firebase/firestore";
import type { PipelineStageId } from "@/types/deals";

export type FormFieldType =
  | "text"
  | "email"
  | "phone"
  | "company"
  | "textarea"
  | "select";

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
  // Maps this field's value back to the Contact shape.
  // "name" | "email" | "phone" | "company" | "notes" | null
  mapsTo: "name" | "email" | "phone" | "company" | "notes" | null;
}

export interface FormSettings {
  pipelineStageId: PipelineStageId | null;
  autoTags: string[];
  thankYouMessage: string;
  redirectUrl: string;
  createDeal: boolean;
  dealTitleTemplate: string;
  dealValue: number;
  dealCurrency: string;
}

export interface LeadForm {
  id: string;
  name: string;
  slug: string;
  fields: FormField[];
  settings: FormSettings;
  ownerId: string;
  enabled: boolean;
  submissionCount: number;
  createdAt: Timestamp | FieldValue | null;
  updatedAt: Timestamp | FieldValue | null;
}

export interface FormSubmission {
  id: string;
  formId: string;
  values: Record<string, string>;
  contactId: string | null;
  dealId: string | null;
  createdAt: Timestamp | FieldValue | null;
}

export function defaultFormFields(): FormField[] {
  return [
    {
      id: "name",
      type: "text",
      label: "Full name",
      placeholder: "Jane Doe",
      required: true,
      options: [],
      mapsTo: "name",
    },
    {
      id: "email",
      type: "email",
      label: "Email",
      placeholder: "jane@example.com",
      required: true,
      options: [],
      mapsTo: "email",
    },
    {
      id: "phone",
      type: "phone",
      label: "Phone",
      placeholder: "+1 555 000 0000",
      required: false,
      options: [],
      mapsTo: "phone",
    },
    {
      id: "company",
      type: "company",
      label: "Company",
      placeholder: "Acme Inc.",
      required: false,
      options: [],
      mapsTo: "company",
    },
  ];
}

export function defaultFormSettings(): FormSettings {
  return {
    pipelineStageId: "new",
    autoTags: ["form"],
    thankYouMessage: "Thanks — we'll be in touch shortly.",
    redirectUrl: "",
    createDeal: false,
    dealTitleTemplate: "New lead — {name}",
    dealValue: 0,
    dealCurrency: "USD",
  };
}
