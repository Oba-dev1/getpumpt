'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Upload, FileSpreadsheet, ChevronRight, AlertTriangle, CheckCircle2, XCircle, Loader2, Sparkles, ChevronDown } from 'lucide-react'
import {
  parseExcelFile,
  getSheetNames,
  autoMapColumns,
  applyColumnMapping,
  type MemberField,
  type ParsedExcelData,
  type MappedMemberRow,
  type DataQualityIssue,
} from '@/lib/excel-parser'
import { bulkMemberRowSchema, type BulkMemberRow } from '@/lib/validations'
import { bulkImportMembers, type ImportResult } from '@/lib/actions/bulk-import'
import { toast } from 'sonner'

type Step = 'upload' | 'map' | 'confirm' | 'results'

const MEMBER_FIELD_LABELS: Record<MemberField, string> = {
  firstName: 'First Name',
  lastName: 'Last Name',
  fullName: 'Full Name (auto-split)',
  email: 'Email',
  phone: 'Phone',
  planName: 'Membership Plan (by name)',
  startDate: 'Subscription Start Date',
  skip: 'Skip this column',
}

interface ValidatedRow {
  data: BulkMemberRow
  rowIndex: number
  valid: boolean
  errors: string[]
  qualityIssues: DataQualityIssue[]
  batchDuplicate?: { ofRow: number; field: 'phone' | 'name' }
}

interface MemberImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gymId: string
  onImportComplete: () => void
}

function validateMappedRows(rows: MappedMemberRow[]): ValidatedRow[] {
  // Build duplicate-detection maps: track the first row index a phone/name appears
  const phonesSeen = new Map<string, number>()
  const namesSeen = new Map<string, number>()

  return rows.map(({ rowIndex, qualityIssues, ...data }) => {
    const result = bulkMemberRowSchema.safeParse({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || undefined,
      phone: data.phone || undefined,
      planName: data.planName || undefined,
      startDate: data.startDate || undefined,
    })

    const rowData: BulkMemberRow = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || undefined,
      phone: data.phone || undefined,
      planName: data.planName || undefined,
      startDate: data.startDate || undefined,
    }

    // Check for batch duplicates
    let batchDuplicate: ValidatedRow['batchDuplicate']
    const fullName = `${data.firstName} ${data.lastName}`.toLowerCase().trim()

    if (data.phone) {
      const seenAt = phonesSeen.get(data.phone)
      if (seenAt !== undefined) {
        batchDuplicate = { ofRow: seenAt, field: 'phone' }
      } else {
        phonesSeen.set(data.phone, rowIndex)
      }
    }

    if (!batchDuplicate && fullName.length > 1) {
      const seenAt = namesSeen.get(fullName)
      if (seenAt !== undefined) {
        batchDuplicate = { ofRow: seenAt, field: 'name' }
      } else {
        namesSeen.set(fullName, rowIndex)
      }
    }

    return {
      data: rowData,
      rowIndex,
      valid: result.success,
      errors: result.success ? [] : result.error.issues.map((e) => e.message),
      qualityIssues,
      batchDuplicate,
    }
  })
}

function getMappingErrors(mapping: Record<string, MemberField>): string[] {
  const fields = Object.values(mapping)
  const errors: string[] = []

  const hasFirstName = fields.includes('firstName')
  const hasLastName = fields.includes('lastName')
  const hasFullName = fields.includes('fullName')

  if (!hasFirstName && !hasLastName && !hasFullName) errors.push('Map at least a Name column')

  const emailCount = fields.filter((f) => f === 'email').length
  if (emailCount > 1) errors.push('Email can only be mapped once')

  return errors
}

export function MemberImportDialog({ open, onOpenChange, gymId, onImportComplete }: MemberImportDialogProps) {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedExcelData | null>(null)
  const [columnMapping, setColumnMapping] = useState<Record<string, MemberField>>({})
  const [validatedRows, setValidatedRows] = useState<ValidatedRow[]>([])
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'update'>('skip')
  const [sendEmail, setSendEmail] = useState(true)
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<ImportResult | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [parsing, setParsing] = useState(false)
  const [availableSheets, setAvailableSheets] = useState<string[]>([])
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0)
  const [showPhoneNorm, setShowPhoneNorm] = useState(false)
  const [showPlanNorm, setShowPlanNorm] = useState(false)
  const [showDuplicates, setShowDuplicates] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => {
    setStep('upload')
    setFile(null)
    setParsedData(null)
    setColumnMapping({})
    setValidatedRows([])
    setDuplicateStrategy('skip')
    setSendEmail(true)
    setImporting(false)
    setResults(null)
    setParseError(null)
    setParsing(false)
    setAvailableSheets([])
    setSelectedSheetIndex(0)
    setShowPhoneNorm(false)
    setShowPlanNorm(false)
    setShowDuplicates(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) reset()
      onOpenChange(next)
    },
    [onOpenChange, reset]
  )

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    const MAX_SIZE = 5 * 1024 * 1024
    if (selected.size > MAX_SIZE) {
      setParseError('File is too large. Maximum size is 5MB.')
      return
    }

    const ext = selected.name.split('.').pop()?.toLowerCase()
    if (ext !== 'xlsx' && ext !== 'xls') {
      setParseError('Please upload an Excel file (.xlsx or .xls)')
      return
    }

    setFile(selected)
    setParseError(null)
    setSelectedSheetIndex(0)
    setAvailableSheets([])

    // Peek at sheet names so the user can pick the right tab before parsing
    getSheetNames(selected)
      .then((names) => setAvailableSheets(names))
      .catch(() => {
        // Non-fatal: fall back to single-sheet behaviour
      })
  }, [])

  const handleParse = useCallback(async () => {
    if (!file) return

    setParsing(true)
    setParseError(null)

    try {
      const data = await parseExcelFile(file, selectedSheetIndex)
      const mapping = autoMapColumns(data.headers)
      setParsedData(data)
      setColumnMapping(mapping)
      setStep('map')
    } catch (err: unknown) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse the file')
    } finally {
      setParsing(false)
    }
  }, [file, selectedSheetIndex])

  const handleMappingChange = useCallback((header: string, field: MemberField) => {
    setColumnMapping((prev) => ({ ...prev, [header]: field }))
  }, [])

  const handlePreviewAndConfirm = useCallback(() => {
    if (!parsedData) return
    const mappedRows = applyColumnMapping(parsedData.rows, columnMapping)
    const validated = validateMappedRows(mappedRows)
    setValidatedRows(validated)
    setStep('confirm')
  }, [parsedData, columnMapping])

  const handleImport = useCallback(async () => {
    const validRows = validatedRows.filter((r) => r.valid).map((r) => r.data)

    if (validRows.length === 0) {
      toast.error('No valid rows to import')
      return
    }

    setImporting(true)

    try {
      const result = await bulkImportMembers({
        gymId,
        members: validRows,
        duplicateStrategy,
        sendWelcomeEmail: sendEmail,
      })

      setResults(result)
      setStep('results')

      if (result.created > 0 || result.updated > 0) {
        onImportComplete()
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Import failed. Please try again.')
    } finally {
      setImporting(false)
    }
  }, [validatedRows, gymId, duplicateStrategy, sendEmail, onImportComplete])

  const mappingErrors = step === 'map' ? getMappingErrors(columnMapping) : []
  const previewRows = parsedData?.rows.slice(0, 5) ?? []
  const validCount = validatedRows.filter((r) => r.valid).length
  const invalidCount = validatedRows.filter((r) => !r.valid).length

  type QualityItem = DataQualityIssue & { rowIndex: number; memberName: string }
  const phoneNormalizations: QualityItem[] = validatedRows.flatMap((r) =>
    r.qualityIssues
      .filter((q) => q.field === 'phone')
      .map((q) => ({ ...q, rowIndex: r.rowIndex, memberName: `${r.data.firstName} ${r.data.lastName}`.trim() }))
  )
  const planNormalizations: QualityItem[] = validatedRows.flatMap((r) =>
    r.qualityIssues
      .filter((q) => q.field === 'planName')
      .map((q) => ({ ...q, rowIndex: r.rowIndex, memberName: `${r.data.firstName} ${r.data.lastName}`.trim() }))
  )
  const batchDuplicates = validatedRows.filter((r) => r.batchDuplicate)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Import Members from Excel</DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Upload an Excel file (.xlsx or .xls) containing your members.'}
            {step === 'map' && 'Map each column to the correct member field, then preview the data.'}
            {step === 'confirm' && 'Review your import before proceeding.'}
            {step === 'results' && 'Import complete.'}
          </DialogDescription>

          {/* Step indicators */}
          <div className="flex items-center gap-1 mt-3 text-sm">
            {(['upload', 'map', 'confirm', 'results'] as Step[]).map((s, i) => {
              const labels: Record<Step, string> = { upload: 'Upload', map: 'Map Columns', confirm: 'Confirm', results: 'Results' }
              const stepOrder: Step[] = ['upload', 'map', 'confirm', 'results']
              const current = stepOrder.indexOf(step)
              const thisIndex = stepOrder.indexOf(s)
              const done = thisIndex < current
              const active = s === step

              return (
                <div key={s} className="flex items-center gap-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${active ? 'bg-primary text-primary-foreground' : done ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {i + 1}. {labels[s]}
                  </span>
                  {i < 3 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                </div>
              )
            })}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-10 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileSpreadsheet className="h-10 w-10 text-green-500" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    <p className="text-xs text-muted-foreground">Click to change file</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="font-medium">Click to upload your Excel file</p>
                    <p className="text-sm text-muted-foreground">.xlsx or .xls, max 5MB</p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Sheet selector — shown when the file has multiple tabs */}
              {availableSheets.length > 1 && (
                <div className="flex items-center gap-3">
                  <Label className="text-sm text-muted-foreground shrink-0">Sheet to import</Label>
                  <Select
                    value={String(selectedSheetIndex)}
                    onValueChange={(v) => setSelectedSheetIndex(Number(v))}
                  >
                    <SelectTrigger className="w-52 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSheets.map((name, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {parseError && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-md">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {parseError}
                </div>
              )}

              <div className="text-sm text-muted-foreground bg-muted rounded-md p-3 space-y-1">
                <p className="font-medium text-foreground">Expected columns (any order):</p>
                <p>First Name, Last Name (or Full Name), Phone — Email is optional</p>
                <p>Optional: Membership Plan (plan name), Start Date (YYYY-MM-DD or DD/MM/YYYY)</p>
                <p>Columns not mapped will be ignored. Maximum 500 rows.</p>
              </div>
            </div>
          )}

          {/* STEP 2: MAP COLUMNS */}
          {step === 'map' && parsedData && (
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-sm font-medium">Column mapping</p>
                <div className="grid gap-2">
                  {parsedData.headers.map((header) => (
                    <div key={header} className="flex items-center gap-3">
                      <span className="text-sm w-48 truncate font-mono bg-muted px-2 py-1 rounded text-muted-foreground" title={header}>
                        {header}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Select
                        value={columnMapping[header] ?? 'skip'}
                        onValueChange={(v) => handleMappingChange(header, v as MemberField)}
                      >
                        <SelectTrigger className="w-52 text-gray-900">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.entries(MEMBER_FIELD_LABELS) as [MemberField, string][]).map(([field, label]) => (
                            <SelectItem key={field} value={field}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              {mappingErrors.length > 0 && (
                <div className="space-y-1">
                  {mappingErrors.map((err) => (
                    <div key={err} className="flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      {err}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm font-medium">Options</p>
                <div className="flex items-center gap-3">
                  <Label className="w-36 text-sm text-muted-foreground">If member exists</Label>
                  <Select
                    value={duplicateStrategy}
                    onValueChange={(v) => setDuplicateStrategy(v as 'skip' | 'update')}
                  >
                    <SelectTrigger className="w-52 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">Skip existing members</SelectItem>
                      <SelectItem value="update">Update existing members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="send-email"
                    checked={sendEmail}
                    onCheckedChange={(checked) => setSendEmail(checked === true)}
                  />
                  <Label htmlFor="send-email" className="text-sm cursor-pointer">
                    Send account setup email to new members (requires email column)
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Preview (first {Math.min(5, previewRows.length)} rows)</p>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {parsedData.headers
                          .filter((h) => columnMapping[h] !== 'skip')
                          .map((h) => (
                            <TableHead key={h} className="text-xs whitespace-nowrap">
                              {h}
                              <span className="ml-1 text-muted-foreground">({MEMBER_FIELD_LABELS[columnMapping[h]]})</span>
                            </TableHead>
                          ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewRows.map((row, i) => (
                        <TableRow key={i}>
                          {parsedData.headers
                            .filter((h) => columnMapping[h] !== 'skip')
                            .map((h) => (
                              <TableCell key={h} className="text-sm py-2 max-w-40 truncate">
                                {row[h] || <span className="text-muted-foreground italic">empty</span>}
                              </TableCell>
                            ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground">
                  {parsedData.rows.length} total rows in file
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRM */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-4">
                  <p className="text-2xl font-bold">{validatedRows.length}</p>
                  <p className="text-sm text-muted-foreground">Total rows</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-2xl font-bold text-green-600">{validCount}</p>
                  <p className="text-sm text-muted-foreground">Valid (will import)</p>
                </div>
                {invalidCount > 0 && (
                  <div className="rounded-lg border border-destructive/30 p-4">
                    <p className="text-2xl font-bold text-destructive">{invalidCount}</p>
                    <p className="text-sm text-muted-foreground">Invalid (will skip)</p>
                  </div>
                )}
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium capitalize">{duplicateStrategy}</p>
                  <p className="text-sm text-muted-foreground">Duplicate strategy</p>
                </div>
              </div>

              {/* Data Quality Report */}
              {(phoneNormalizations.length > 0 || planNormalizations.length > 0 || batchDuplicates.length > 0) && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Data Quality Report — auto-corrections applied</p>
                  </div>

                  {phoneNormalizations.length > 0 && (
                    <div>
                      <button
                        className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
                        onClick={() => setShowPhoneNorm((v) => !v)}
                      >
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showPhoneNorm ? 'rotate-180' : ''}`} />
                        {phoneNormalizations.length} phone number{phoneNormalizations.length !== 1 ? 's' : ''} normalized (leading 0 added)
                      </button>
                      {showPhoneNorm && (
                        <div className="mt-1.5 rounded border bg-white dark:bg-background overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs h-7">Row</TableHead>
                                <TableHead className="text-xs h-7">Before</TableHead>
                                <TableHead className="text-xs h-7">After</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {phoneNormalizations.map((n, i) => (
                                <TableRow key={i}>
                                  <TableCell className="text-xs py-1">{n.rowIndex}</TableCell>
                                  <TableCell className="text-xs py-1 font-mono text-muted-foreground">{n.original}</TableCell>
                                  <TableCell className="text-xs py-1 font-mono text-green-600">{n.normalized}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )}

                  {planNormalizations.length > 0 && (
                    <div>
                      <button
                        className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
                        onClick={() => setShowPlanNorm((v) => !v)}
                      >
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showPlanNorm ? 'rotate-180' : ''}`} />
                        {planNormalizations.length} plan name{planNormalizations.length !== 1 ? 's' : ''} cleaned (extra text stripped)
                      </button>
                      {showPlanNorm && (
                        <div className="mt-1.5 rounded border bg-white dark:bg-background overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs h-7">Row</TableHead>
                                <TableHead className="text-xs h-7">Before</TableHead>
                                <TableHead className="text-xs h-7">After</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {planNormalizations.map((n, i) => (
                                <TableRow key={i}>
                                  <TableCell className="text-xs py-1">{n.rowIndex}</TableCell>
                                  <TableCell className="text-xs py-1 font-mono text-muted-foreground">{n.original}</TableCell>
                                  <TableCell className="text-xs py-1 font-mono text-green-600">{n.normalized}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )}

                  {batchDuplicates.length > 0 && (
                    <div>
                      <button
                        className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-1 hover:underline"
                        onClick={() => setShowDuplicates((v) => !v)}
                      >
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDuplicates ? 'rotate-180' : ''}`} />
                        {batchDuplicates.length} potential duplicate{batchDuplicates.length !== 1 ? 's' : ''} found in this batch
                      </button>
                      {showDuplicates && (
                        <div className="mt-1.5 rounded border bg-white dark:bg-background overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs h-7">Row</TableHead>
                                <TableHead className="text-xs h-7">Name</TableHead>
                                <TableHead className="text-xs h-7">Matches</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {batchDuplicates.map((r) => (
                                <TableRow key={r.rowIndex}>
                                  <TableCell className="text-xs py-1">{r.rowIndex}</TableCell>
                                  <TableCell className="text-xs py-1">{r.data.firstName} {r.data.lastName}</TableCell>
                                  <TableCell className="text-xs py-1 text-amber-600">
                                    Same {r.batchDuplicate!.field === 'phone' ? 'phone number' : 'name'} as row {r.batchDuplicate!.ofRow}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {invalidCount > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    Invalid rows (will be skipped)
                  </p>
                  <div className="rounded-md border max-h-48 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Row</TableHead>
                          <TableHead className="text-xs">Name</TableHead>
                          <TableHead className="text-xs">Issues</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validatedRows
                          .filter((r) => !r.valid)
                          .map((r) => (
                            <TableRow key={r.rowIndex}>
                              <TableCell className="text-sm">{r.rowIndex}</TableCell>
                              <TableCell className="text-sm">{r.data.firstName} {r.data.lastName}</TableCell>
                              <TableCell className="text-sm text-destructive">{r.errors.join(', ')}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {sendEmail && validCount > 0 && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted rounded-md p-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    New members will receive an account setup email with a link to set their password (valid for 7 days).
                  </span>
                </div>
              )}

              {validatedRows.some((r) => r.valid && r.data.planName) && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted rounded-md p-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Membership plan column detected. Members with a recognised plan name will have their subscription created and expiry calculated automatically. Unrecognised plan names are ignored — the member is still created.
                  </span>
                </div>
              )}

              {validCount === 0 && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-md">
                  <XCircle className="h-4 w-4 shrink-0" />
                  No valid rows to import. Go back and fix the column mapping.
                </div>
              )}
            </div>
          )}

          {/* STEP 4: RESULTS */}
          {step === 'results' && results && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 p-4 flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                  <div>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">{results.created}</p>
                    <p className="text-sm text-green-600 dark:text-green-500">Members created</p>
                  </div>
                </div>

                {results.updated > 0 && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-blue-600 shrink-0" />
                    <div>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{results.updated}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-500">Members updated</p>
                    </div>
                  </div>
                )}

                {results.skipped > 0 && (
                  <div className="rounded-lg border p-4 flex items-center gap-3">
                    <div>
                      <p className="text-2xl font-bold text-muted-foreground">{results.skipped}</p>
                      <p className="text-sm text-muted-foreground">Skipped (already exist)</p>
                    </div>
                  </div>
                )}

                {results.failed.length > 0 && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3">
                    <XCircle className="h-6 w-6 text-destructive shrink-0" />
                    <div>
                      <p className="text-2xl font-bold text-destructive">{results.failed.length}</p>
                      <p className="text-sm text-muted-foreground">Failed</p>
                    </div>
                  </div>
                )}
              </div>

              {results.expiredMemberships > 0 && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      {results.expiredMemberships} member{results.expiredMemberships !== 1 ? 's' : ''} imported with already-expired subscription{results.expiredMemberships !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                      Their memberships have been recorded with an Expired status. Review their accounts and consider reaching out to renew.
                    </p>
                  </div>
                </div>
              )}

              {results.failed.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">Failed rows</p>
                  <div className="rounded-md border max-h-48 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Row</TableHead>
                          <TableHead className="text-xs">Member</TableHead>
                          <TableHead className="text-xs">Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.failed.map((f) => (
                          <TableRow key={f.row}>
                            <TableCell className="text-sm">{f.row}</TableCell>
                            <TableCell className="text-sm">{f.identifier}</TableCell>
                            <TableCell className="text-sm text-destructive">{f.error}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {results.unrecognizedPlanNames.length > 0 && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        {results.unrecognizedPlanNames.length} plan name{results.unrecognizedPlanNames.length !== 1 ? 's' : ''} not matched — memberships were not created
                      </p>
                      <ul className="space-y-0.5">
                        {results.unrecognizedPlanNames.map((name) => (
                          <li key={name} className="text-sm font-mono text-amber-700 dark:text-amber-400">{name}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        Tip: Create these plans in Membership Plans, then re-import the affected rows.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {results.membersWithPaymentDateNoPlan.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1.5 w-full">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        {results.membersWithPaymentDateNoPlan.length} member{results.membersWithPaymentDateNoPlan.length !== 1 ? 's' : ''} imported with a payment date but no plan assigned
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        Use the payment dates below as the start date when assigning their membership plans.
                      </p>
                      <div className="rounded border bg-white dark:bg-background overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs h-7">Name</TableHead>
                              <TableHead className="text-xs h-7">Email / Phone</TableHead>
                              <TableHead className="text-xs h-7">Payment Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {results.membersWithPaymentDateNoPlan.map((m, i) => (
                              <TableRow key={i}>
                                <TableCell className="text-xs py-1">{m.name}</TableCell>
                                <TableCell className="text-xs py-1 text-muted-foreground">{m.identifier}</TableCell>
                                <TableCell className="text-xs py-1 font-mono text-amber-700 dark:text-amber-400">{m.paymentDate}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sendEmail && results.created > 0 && (
                <p className="text-sm text-muted-foreground">
                  Account setup emails have been queued for {results.created} new member{results.created !== 1 ? 's' : ''}.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          {step === 'upload' && (
            <>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleParse} disabled={!file || parsing}>
                {parsing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {parsing ? 'Reading file...' : 'Next'}
              </Button>
            </>
          )}

          {step === 'map' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button onClick={handlePreviewAndConfirm} disabled={mappingErrors.length > 0}>
                Preview & Confirm
              </Button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <Button variant="outline" onClick={() => setStep('map')} disabled={importing}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={importing || validCount === 0}>
                {importing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {importing ? `Importing...` : `Import ${validCount} member${validCount !== 1 ? 's' : ''}`}
              </Button>
            </>
          )}

          {step === 'results' && (
            <>
              <Button variant="outline" onClick={reset}>
                Import another file
              </Button>
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
