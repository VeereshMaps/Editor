import { renderDate } from './utils'

export const VersionItem = ({
  title,
  date,
  isActive,
  isSelected,
  onClick,
}) => {
  return (
    <button style={{cursor:'pointer',border:!isActive ? '1px solid gray':'none',borderRadius:'5px'}} onClick={onClick} className={isActive ? 'is-active' : ''}>
      {isSelected ? '> ' : ''}{title || renderDate(date)}
      {title ? <span>{renderDate(date)}</span> : null}
    </button>
  )
}