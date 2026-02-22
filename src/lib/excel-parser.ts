import * as XLSX from 'xlsx'

export type MemberField = 'firstName' | 'lastName' | 'fullName' | 'email' | 'phone' | 'skip'

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
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
          defval: '',
          raw: false,
        })

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
  rowIndex: number
}

export function applyColumnMapping(
  rows: Record<string, string>[],
  mapping: Record<string, MemberField>
): MappedMemberRow[] {
  return rows.map((row, index) => {
    const mapped: Partial<MappedMemberRow> & { fullName?: string } = { rowIndex: index + 1 }

    for (const [header, field] of Object.entries(mapping)) {
      if (field === 'skip') continue
      const value = row[header]?.toString().trim() ?? ''

      if (field === 'fullName') {
        mapped.fullName = value
      } else if (field === 'firstName' || field === 'lastName' || field === 'email' || field === 'phone') {
        mapped[field] = value
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
      rowIndex: mapped.rowIndex ?? index + 1,
    }
  })
}
