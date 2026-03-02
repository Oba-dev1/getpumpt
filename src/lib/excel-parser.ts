import * as XLSX from 'xlsx'
import { normalizePhone, normalizePlanName } from '@/lib/utils'

export type MemberField = 'firstName' | 'lastName' | 'fullName' | 'email' | 'phone' | 'planName' | 'startDate' | 'skip'

export interface DataQualityIssue {
  field: 'phone' | 'planName'
  original: string
  normalized: string
}

export interface ParsedExcelData {
  headers: string[]
  rows: Record<string, string>[]
  sheetNames: string[]
}

export function parseExcelFile(file: File, sheetIndex: number = 0): Promise<ParsedExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[sheetIndex]

        if (!sheetName) {
          reject(new Error('No sheets found in the file'))
          return
        }

        const sheet = workbook.Sheets[sheetName]
        const allRows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
          defval: '',
          raw: false,
        })

        // Drop rows where every cell is an empty string — these are "phantom" rows
        // that Excel marks as used from scrolling, formatting, or prior edits.
        const jsonData = allRows.filter((row) =>
          Object.values(row).some((v) => v.toString().trim() !== '')
        )

        if (jsonData.length === 0) {
          reject(new Error('The sheet contains no data rows'))
          return
        }

        const headers = Object.keys(jsonData[0])

        resolve({ headers, rows: jsonData, sheetNames: workbook.SheetNames })
      } catch {
        reject(new Error('Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.'))
      }
    }

    reader.onerror = () => reject(new Error('Failed to read the file'))
    reader.readAsArrayBuffer(file)
  })
}

// Reads only the workbook structure to extract sheet names without parsing cell data.
export function getSheetNames(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array', bookSheets: true })
        resolve(workbook.SheetNames)
      } catch {
        reject(new Error('Failed to read sheet names from file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read the file'))
    reader.readAsArrayBuffer(file)
  })
}

const COLUMN_NAME_MAP: Record<string, MemberField> = {
  'first name': 'firstName',
  'firstname': 'firstName',
  'first': 'firstName',
  'given name': 'firstName',
  'given_name': 'firstName',
  'last name': 'lastName',
  'lastname': 'lastName',
  'last': 'lastName',
  'surname': 'lastName',
  'family name': 'lastName',
  'family_name': 'lastName',
  'name': 'fullName',
  'full name': 'fullName',
  'fullname': 'fullName',
  'member name': 'fullName',
  'email': 'email',
  'email address': 'email',
  'email_address': 'email',
  'e-mail': 'email',
  'e_mail': 'email',
  'phone': 'phone',
  'phone number': 'phone',
  'phone_number': 'phone',
  'telephone': 'phone',
  'mobile': 'phone',
  'mobile number': 'phone',
  'cell': 'phone',
  'contact': 'phone',
  'plan': 'planName',
  'plan name': 'planName',
  'membership plan': 'planName',
  'membership': 'planName',
  'membership type': 'planName',
  'membership_type': 'planName',
  'type': 'planName',
  'package': 'planName',
  'subscription': 'planName',
  'subscription plan': 'planName',
  'start date': 'startDate',
  'startdate': 'startDate',
  'start': 'startDate',
  'join date': 'startDate',
  'joined': 'startDate',
  'date joined': 'startDate',
  'subscription date': 'startDate',
  'date started': 'startDate',
  'date of payment': 'startDate',
  'date_of_payment': 'startDate',
  'payment date': 'startDate',
  // Columns common in gym ledger sheets that should be skipped
  's/n': 'skip',
  'sn': 'skip',
  '#': 'skip',
  'no': 'skip',
  'no.': 'skip',
  'serial no': 'skip',
  'serial': 'skip',
  'serial number': 'skip',
  'expiry date': 'skip',
  'expiry_date': 'skip',
  'expiry': 'skip',
  'end date': 'skip',
  'amount paid': 'skip',
  'amount_paid': 'skip',
  'amount': 'skip',
  'payment mode': 'skip',
  'payment_mode': 'skip',
  'mode': 'skip',
  'status': 'skip',
}

export function autoMapColumns(headers: string[]): Record<string, MemberField> {
  const mapping: Record<string, MemberField> = {}

  for (const header of headers) {
    const normalized = header.toLowerCase().trim()
    mapping[header] = COLUMN_NAME_MAP[normalized] ?? 'skip'
  }

  return mapping
}

export interface MappedMemberRow {
  firstName: string
  lastName: string
  email: string
  phone: string
  planName: string
  startDate: string
  rowIndex: number
  qualityIssues: DataQualityIssue[]
}

export function applyColumnMapping(
  rows: Record<string, string>[],
  mapping: Record<string, MemberField>
): MappedMemberRow[] {
  return rows.map((row, index) => {
    const mapped: Partial<MappedMemberRow> & { fullName?: string } = { rowIndex: index + 1 }
    const qualityIssues: DataQualityIssue[] = []

    for (const [header, field] of Object.entries(mapping)) {
      if (field === 'skip') continue
      const value = row[header]?.toString().trim() ?? ''

      if (field === 'fullName') {
        mapped.fullName = value
      } else if (field === 'firstName' || field === 'lastName' || field === 'email' || field === 'startDate') {
        mapped[field] = value
      } else if (field === 'phone') {
        if (value) {
          const { value: normalized, changed } = normalizePhone(value)
          mapped.phone = normalized
          if (changed) qualityIssues.push({ field: 'phone', original: value, normalized })
        } else {
          mapped.phone = value
        }
      } else if (field === 'planName') {
        if (value) {
          const normalized = normalizePlanName(value)
          mapped.planName = normalized
          if (normalized !== value) qualityIssues.push({ field: 'planName', original: value, normalized })
        } else {
          mapped.planName = value
        }
      }
    }

    // Split full name into first/last if needed
    if (mapped.fullName && !mapped.firstName && !mapped.lastName) {
      const parts = mapped.fullName.trim().split(/\s+/)
      mapped.firstName = parts[0] ?? ''
      mapped.lastName = parts.slice(1).join(' ') || (parts[0] ?? '')
    }

    delete mapped.fullName

    return {
      firstName: mapped.firstName ?? '',
      lastName: mapped.lastName ?? '',
      email: mapped.email ?? '',
      phone: mapped.phone ?? '',
      planName: mapped.planName ?? '',
      startDate: mapped.startDate ?? '',
      rowIndex: mapped.rowIndex ?? index + 1,
      qualityIssues,
    }
  })
}
