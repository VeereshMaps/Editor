import { renderDate } from './utils'

export const VersionItem = ({
  title,
  date,
  isActive,
  isSelected,
  onClick,
}) => {
  return (
    <button onClick={onClick} className={isActive ? 'is-active' : ''}>
      {isSelected ? '> ' : ''}{title || renderDate(date)}
      {title ? <span>{renderDate(date)}</span> : null}
    </button>
  )
}