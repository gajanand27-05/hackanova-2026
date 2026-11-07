export function Placeholder({ children = 'Announcing soon' }) {
  return <span className="badge-tbc">{children}</span>
}

export function orTBC(value, label = 'TBC') {
  return value ?? <Placeholder>{label}</Placeholder>
}
