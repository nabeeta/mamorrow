import { useEffect, useState } from 'react'

export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`)
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .finally(() => setLoading(false))
  }, [])

  return { tasks, loading }
}
