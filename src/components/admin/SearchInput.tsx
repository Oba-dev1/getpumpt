'use client'

import { useCallback, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface SearchInputProps {
  placeholder?: string
  onSearch: (query: string) => void
  defaultValue?: string
  className?: string
  ariaLabel?: string
}

export function SearchInput({
  placeholder = 'Search...',
  onSearch,
  defaultValue = '',
  className,
  ariaLabel,
}: SearchInputProps) {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)
      onSearch(newValue)
    },
    [onSearch]
  )

  return (
    <div className={`relative ${className ?? ''}`}>
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        aria-hidden="true"
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        aria-label={ariaLabel ?? placeholder}
        className="pl-10"
      />
    </div>
  )
}
