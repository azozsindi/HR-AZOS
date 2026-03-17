// src/types.ts

export interface Industry {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
  color: string;
}

export interface Employee {
  id: string;
  name: string;
  idNumber: string;
  jobTitle: string;
  department: string;
  salary: number;
  hireDate: string;
  nationality: string;
}

export interface Company {
  name: string;
  nameEn: string;
  logo: string | null;
  primaryColor: string;
  industry: string;
  address: string;
  addressEn: string;
  phone: string;
  email: string;
  website: string;
  tagline: string;
  crNumber?: string;
  vatNumber?: string;
  stampMode: "manual" | "digital" | "none";
  stampImage: string | null;
  employees?: Employee[];
}

export interface Form {
  id: string;
  icon: string;
  title: string;
  titleEn: string;
  cat: string;
  industries: string[];
}

export interface Field {
  key: string;
  label: string;
  labelEn: string;
  placeholder?: string;
  type?: string;
  options?: string[];
  rows?: number;
}

export interface FormDefinition {
  title: string;
  titleEn: string;
  fields: Field[];
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  role: "superadmin" | "company";
  companyData: Company;
  companyId?: string;
}
