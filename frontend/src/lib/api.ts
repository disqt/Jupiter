const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getWorkouts: (month: string) => fetchApi<any[]>(`/api/workouts?month=${month}`),
  getWorkout: (id: number) => fetchApi<any>(`/api/workouts/${id}`),
  createWorkout: (data: any) => fetchApi<any>('/api/workouts', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkout: (id: number, data: any) => fetchApi<any>(`/api/workouts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWorkout: (id: number) => fetchApi<any>(`/api/workouts/${id}`, { method: 'DELETE' }),
  getExercises: () => fetchApi<any[]>('/api/exercises'),
  createExercise: (data: any) => fetchApi<any>('/api/exercises', { method: 'POST', body: JSON.stringify(data) }),
  getLastPerformance: (exerciseId: number) => fetchApi<any[]>(`/api/exercises/${exerciseId}/last-performance`),
  getMonthlyStats: (month: string) => fetchApi<any>(`/api/stats/monthly?month=${month}`),
};
