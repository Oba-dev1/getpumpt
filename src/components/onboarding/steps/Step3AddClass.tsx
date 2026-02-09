'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createOnboardingClass } from '@/lib/actions/onboarding'
import { onboardingClassSchema, type OnboardingClassInput } from '@/lib/validations/onboarding'
import { Dumbbell } from 'lucide-react'

interface Step3AddClassProps {
  onComplete: () => void
}

export function Step3AddClass({ onComplete }: Step3AddClassProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingClassInput>({
    resolver: zodResolver(onboardingClassSchema),
    defaultValues: {
      name: '',
      category: 'HIIT',
      duration: 60,
      capacity: 20,
    },
  })

  const category = watch('category')

  const onSubmit = async (data: OnboardingClassInput) => {
    setLoading(true)
    try {
      const result = await createOnboardingClass(data)
      if (result.success) {
        toast.success('Gym class created successfully!')
        onComplete()
      } else {
        toast.error(result.error || 'Failed to create class')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border-border/70 shadow-none">
        <CardHeader className="space-y-2">
          <CardTitle>Add your first class (optional)</CardTitle>
          <CardDescription>
            Create a class members can book right away.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Class Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Morning HIIT, Yoga Flow"
              aria-describedby="class-name-help"
              {...register('name')}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
            <p id="class-name-help" className="text-sm text-muted-foreground">
              Name the class the way members would search for it.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={category}
              onValueChange={(value: 'HIIT' | 'YOGA' | 'STRENGTH' | 'CARDIO' | 'SPIN' | 'CROSSFIT' | 'PILATES' | 'BOXING' | 'DANCE' | 'OTHER') =>
                setValue('category', value)
              }
              disabled={loading}
            >
              <SelectTrigger
                id="category"
                aria-describedby="class-category-help"
                className="bg-background text-foreground border-border"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background text-foreground">
                <SelectItem value="HIIT">HIIT</SelectItem>
                <SelectItem value="YOGA">Yoga</SelectItem>
                <SelectItem value="STRENGTH">Strength Training</SelectItem>
                <SelectItem value="CARDIO">Cardio</SelectItem>
                <SelectItem value="SPIN">Spin/Cycling</SelectItem>
                <SelectItem value="CROSSFIT">CrossFit</SelectItem>
                <SelectItem value="PILATES">Pilates</SelectItem>
                <SelectItem value="BOXING">Boxing</SelectItem>
                <SelectItem value="DANCE">Dance</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive" role="alert">
                {errors.category.message}
              </p>
            )}
            <p id="class-category-help" className="text-sm text-muted-foreground">
              Categories help members discover your classes faster.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                placeholder="60"
                min="15"
                max="300"
                aria-describedby="class-duration-help"
                {...register('duration', { valueAsNumber: true })}
                disabled={loading}
              />
              {errors.duration && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.duration.message}
                </p>
              )}
              <p id="class-duration-help" className="text-sm text-muted-foreground">
                Typical class lengths are 30, 45, or 60 minutes.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Max Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="20"
                min="1"
                aria-describedby="class-capacity-help"
                {...register('capacity', { valueAsNumber: true })}
                disabled={loading}
              />
              {errors.capacity && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.capacity.message}
                </p>
              )}
              <p id="class-capacity-help" className="text-sm text-muted-foreground">
                Set a realistic capacity based on your space.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <Dumbbell className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-foreground">Class tips</p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                  <li>Start with one signature class to test demand.</li>
                  <li>Schedules and trainers can be added later.</li>
                  <li>This step is optional, and you can skip it for now.</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
