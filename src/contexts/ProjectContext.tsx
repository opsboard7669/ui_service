import { createContext, useContext, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { projectApi } from '../lib/api'

interface Project {
  _id: string
  name: string
  description: string
  workspaceId: string
  organizationId: string
  icon?: string
  color?: string
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Archived'
  slug?: string
  memberCount?: number
  taskCount?: number
  ownerId?: string
  startDate?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

interface ProjectContextType {
  projectId: string | undefined
  project: Project | undefined
  isLoading: boolean
  error: Error | null
  workspaceId: string | undefined
  refetch: () => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { id: projectId } = useParams()

  const { data: project, isLoading, error, refetch } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null
      const response = await projectApi.getById(projectId)
      return response.data?.data
    },
    enabled: !!projectId,
    retry: 1,
  })

  const value: ProjectContextType = {
    projectId,
    project: project || undefined,
    isLoading,
    error: error || null,
    workspaceId: project?.workspaceId,
    refetch,
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
