type TaskListProps = {
  tasks: Array<{ id: number; title: string }>
}

export function TaskList({ tasks }: TaskListProps) {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  )
}
