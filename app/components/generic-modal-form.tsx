'use client'

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'

export type ModalFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'textarea'
  | 'date'

export interface ModalFormField {
  id: string
  label: string
  type: ModalFieldType
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  defaultValue?: any
  validation?: {
    pattern?: string
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    message?: string
  }
}

export interface GenericModalFormProps {
  isOpen: boolean
  onClose: () => void
  title: string
  fields: ModalFormField[]
  onSubmit: (data: Record<string, any>) => void
  submitText?: string
  cancelText?: string
  initialData?: Record<string, any>
}

export default function GenericModalForm({
  isOpen,
  onClose,
  title,
  fields,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  initialData = {},
}: GenericModalFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Initialize form data with default values or empty strings
    const initialFormData: Record<string, any> = {}
    fields.forEach((field) => {
      initialFormData[field.id] = initialData[field.id] ?? field.defaultValue ?? ''
    })
    setFormData(initialFormData)
    setErrors({})
  }, [fields, initialData, isOpen])

  const handleChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }))

    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  const validateField = (field: ModalFormField, value: any): string | null => {
    if (field.required && !value) {
      return 'This field is required'
    }

    if (field.validation) {
      if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
        return field.validation.message || 'Invalid format'
      }

      if (field.type === 'number' && field.validation) {
        const numValue = Number(value)
        if (field.validation.min !== undefined && numValue < field.validation.min) {
          return field.validation.message || `Value must be at least ${field.validation.min}`
        }
        if (field.validation.max !== undefined && numValue > field.validation.max) {
          return field.validation.message || `Value must be at most ${field.validation.max}`
        }
      }

      if (field.validation.minLength && String(value).length < field.validation.minLength) {
        return (
          field.validation.message || `Must be at least ${field.validation.minLength} characters`
        )
      }

      if (field.validation.maxLength && String(value).length > field.validation.maxLength) {
        return (
          field.validation.message || `Must be at most ${field.validation.maxLength} characters`
        )
      }
    }

    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const newErrors: Record<string, string> = {}
    let isValid = true

    fields.forEach((field) => {
      const error = validateField(field, formData[field.id])
      if (error) {
        newErrors[field.id] = error
        isValid = false
      }
    })

    setErrors(newErrors)

    if (isValid) {
      onSubmit(formData)
    }
  }

  const renderField = (field: ModalFormField) => {
    const commonProps = {
      id: field.id,
      name: field.id,
      value: formData[field.id] ?? '',
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => handleChange(field.id, e.target.value),
      placeholder: field.placeholder,
      // inset 0 0 0px 1000px var(--tw-shadow-color, rgb(21 22 51 / 74%))
      className: `mt-1 block w-full h-[48px] pl-4 rounded-md border-gray-100 shadow-sm sm:text-sm autofill:shadow-[inset_0_0_0px_1000px_var(--tw-shadow-color,rgb(21_22_51/_74%))] ${
        errors[field.id] ? 'border-red-500' : 'border-gray-100'
      }`,
    }

    switch (field.type) {
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'textarea':
        return <textarea {...commonProps} rows={4} />

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.id}
              name={field.id}
              checked={!!formData[field.id]}
              onChange={(e) => handleChange(field.id, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-gray-600 focus:ring-gray-600"
            />
          </div>
        )

      case 'date':
        return (
          <input type="date" {...commonProps} value={formData[field.id]?.split('T')[0] || ''} />
        )

      default:
        return <input type={field.type} {...commonProps} />
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  {title}
                </DialogTitle>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  {fields.map((field) => (
                    <div key={field.id} className="space-y-1">
                      <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && <span className="text-red-500"> *</span>}
                      </label>

                      <div className={field.type === 'checkbox' ? 'flex items-center' : ''}>
                        {renderField(field)}
                      </div>

                      {errors[field.id] && (
                        <p className="mt-1 text-sm text-red-600">{errors[field.id]}</p>
                      )}
                    </div>
                  ))}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200"
                    >
                      {cancelText}
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      {submitText}
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
