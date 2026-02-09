'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Stepper } from '@/components/onboarding/Stepper'
import { WizardNavigation } from '@/components/onboarding/WizardNavigation'
import { Step1AddPlan } from '@/components/onboarding/steps/Step1AddPlan'
import { Step2CustomizeGym } from '@/components/onboarding/steps/Step2CustomizeGym'
import { Step3AddClass } from '@/components/onboarding/steps/Step3AddClass'
import { Step4InviteTeam } from '@/components/onboarding/steps/Step4InviteTeam'
import { skipOnboardingStep, completeOnboarding } from '@/lib/actions/onboarding'
import { toast } from 'sonner'

const steps = [
  { label: 'Add Membership Plan', optional: false },
  { label: 'Customize Branding', optional: false },
  { label: 'Add First Class', optional: true },
  { label: 'Invite Team', optional: true },
]

export default function SetupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = async () => {
    setLoading(true)
    try {
      const result = await skipOnboardingStep(currentStep)
      if (result.success) {
        toast.success('Step skipped')
        handleNext()
      } else {
        toast.error(result.error || 'Failed to skip step')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      const result = await completeOnboarding()
      if (result.success) {
        toast.success('Setup complete! Welcome to your gym dashboard')
        router.push('/admin')
      } else {
        toast.error(result.error || 'Failed to complete onboarding')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1AddPlan onComplete={handleNext} />
      case 2:
        return <Step2CustomizeGym onComplete={handleNext} />
      case 3:
        return <Step3AddClass onComplete={handleNext} />
      case 4:
        return <Step4InviteTeam onComplete={handleNext} />
      default:
        return null
    }
  }

  const isOptionalStep = steps[currentStep - 1]?.optional
  const isLastStep = currentStep === steps.length

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10">
      <header className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Onboarding
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Set up your gym in a few quick steps
        </h1>
        <p className="text-base text-muted-foreground">
          Complete the essentials now and fine-tune the details later.
        </p>
      </header>

      <section className="rounded-2xl border border-border/70 bg-background p-6 shadow-sm">
        <Stepper
          currentStep={currentStep}
          totalSteps={steps.length}
          steps={steps}
        />
      </section>

      <section className="rounded-2xl border border-border/70 bg-background p-6 shadow-sm">
        {renderStep()}
      </section>

      <WizardNavigation
        onBack={currentStep > 1 ? handleBack : undefined}
        onNext={isLastStep ? handleComplete : handleNext}
        onSkip={isOptionalStep ? handleSkip : undefined}
        nextLabel={isLastStep ? 'Complete Setup' : 'Next'}
        loading={loading}
        isFirstStep={currentStep === 1}
        isLastStep={isLastStep}
        canSkip={isOptionalStep}
      />
    </div>
  )
}
