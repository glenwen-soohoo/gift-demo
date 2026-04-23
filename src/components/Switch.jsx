export default function Switch({ checked, onChange, size = 'md', disabled = false }) {
  const handleClick = () => {
    if (disabled) return
    onChange(!checked)
  }
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`ui-switch ui-switch-${size} ${checked ? 'on' : 'off'} ${disabled ? 'is-disabled' : ''}`}
      onClick={handleClick}
    >
      <span className="ui-switch-knob" />
    </button>
  )
}
