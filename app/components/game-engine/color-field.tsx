import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'

interface ColorFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export default function ColorField({ label, value, onChange }: ColorFieldProps) {
  const [open, setOpen] = useState(false)
  return (
    <div className="engine-color-field">
      <div className="engine-field">
        <span>{label}</span>
        <button
          type="button"
          className="engine-color-swatch"
          style={{ background: value }}
          aria-expanded={open}
          aria-label={label}
          onClick={() => setOpen((current) => !current)}
        />
      </div>
      {open && <HexColorPicker color={value} onChange={onChange} />}
    </div>
  )
}
