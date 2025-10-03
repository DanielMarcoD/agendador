'use client'

import React, { forwardRef } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import { ptBR } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'

// Registrar a localização portuguesa
registerLocale('pt-BR', ptBR)

interface DateTimePickerProps {
  selected: Date | null
  onChange: (date: Date | null) => void
  placeholderText?: string
  showTimeSelect?: boolean
  timeFormat?: string
  timeIntervals?: number
  dateFormat?: string
  className?: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  id?: string
  name?: string
}

const CustomInput = forwardRef<HTMLInputElement, any>(({ value, onClick, className, placeholder, disabled }, ref) => (
  <div className="input-group">
    <input
      ref={ref}
      type="text"
      className={className}
      value={value}
      onClick={onClick}
      placeholder={placeholder}
      readOnly
      disabled={disabled}
    />
    <span className="input-group-text">
      <i className="fas fa-calendar-alt"></i>
    </span>
  </div>
))

CustomInput.displayName = 'CustomInput'

export default function DateTimePicker({
  selected,
  onChange,
  placeholderText = "Selecione data e hora",
  showTimeSelect = true,
  timeFormat = "HH:mm",
  timeIntervals = 15,
  dateFormat = "dd/MM/yyyy HH:mm",
  className = "form-control",
  minDate,
  maxDate,
  disabled = false,
  id,
  name
}: DateTimePickerProps) {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      showTimeSelect={showTimeSelect}
      timeFormat={timeFormat}
      timeIntervals={timeIntervals}
      dateFormat={dateFormat}
      locale="pt-BR"
      placeholderText={placeholderText}
      customInput={<CustomInput className={className} placeholder={placeholderText} disabled={disabled} />}
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
      id={id}
      name={name}
      popperClassName="custom-datepicker-popper"
      calendarClassName="custom-datepicker-calendar"
      timeCaption="Hora"
      showPopperArrow={false}
      todayButton="Hoje"
      clearButtonTitle="Limpar"
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
    />
  )
}
