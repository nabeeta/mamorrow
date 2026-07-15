export async function fetchTasks() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`)
  return response.json()
}
