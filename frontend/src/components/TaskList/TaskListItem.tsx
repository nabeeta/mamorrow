type TaskListItemProps = {
  title: string
}

export function TaskListItem({ title }: TaskListItemProps) {
  return <div>{title}</div>
}
