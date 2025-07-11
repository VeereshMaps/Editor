import { renderDate } from './utils'

export const VersionItem = ({
  title,
  date,
  isActive,
  onClick,
}) => {
  return (
    <button onClick={onClick} className={isActive ? 'is-active' : ''}  style={{cursor:'pointer'}}>
      {title || renderDate(date)}
      {title ? <span>{renderDate(date)}</span> : null}
    </button>
  )
}