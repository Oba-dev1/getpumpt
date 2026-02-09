import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface WizardNavigationProps {
  onBack?: () => void
  onNext: () => Promise<void> | void
  onSkip?: () => Promise<void> | void
  nextLabel?: string
  loading?: boolean
  isFirstStep?: boolean
  isLastStep?: boolean
  canSkip?: boolean
  disabled?: boolean
}

export function WizardNavigation({
  onBack,
  onNext,
  onSkip,
  nextLabel = 'Next',
  loading = false,
  isFirstStep = false,
  isLastStep = false,
  canSkip = false,
  disabled = false,
}: WizardNavigationProps) {
  return (
    <div
      className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Onboarding navigation"
    >
      <div>
        {!isFirstStep && onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={loading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {canSkip && onSkip && (
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            disabled={loading}
          >
            Skip
          </Button>
        )}

        <Button
          type="button"
          onClick={onNext}
          loading={loading}
          disabled={disabled}
        >
          {nextLabel}
          {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
