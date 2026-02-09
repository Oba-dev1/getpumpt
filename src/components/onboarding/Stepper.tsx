import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepperProps {
  currentStep: number
  totalSteps: number
  steps: Array<{ label: string; optional?: boolean }>
}

export function Stepper({ currentStep, totalSteps, steps }: StepperProps) {
  return (
    <div className="w-full" role="list" aria-label="Onboarding steps">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <div
              key={stepNumber}
              className="flex flex-1 items-center"
              role="listitem"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                    {
                      'bg-primary border-primary text-primary-foreground':
                        isCompleted || isCurrent,
                      'border-muted-foreground/40 text-muted-foreground':
                        isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn('text-sm font-medium', {
                      'text-foreground': isCurrent,
                      'text-muted-foreground': !isCurrent,
                    })}
                  >
                    {step.label}
                  </p>
                  {step.optional && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      <span className="sr-only">Optional step:</span>
                      (Optional)
                    </p>
                  )}
                </div>
              </div>

              {stepNumber < totalSteps && (
                <div
                  className={cn('mx-2 h-0.5 flex-1 transition-colors', {
                    'bg-primary': stepNumber < currentStep,
                    'bg-muted': stepNumber >= currentStep,
                  })}
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
