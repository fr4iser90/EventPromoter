// History service for managing project history and analytics

import { History, HistoryEntry } from '../types/index.js'
import { readConfig, writeConfig } from '../utils/fileUtils.js'

const HISTORY_FILE = 'history.json'

export class HistoryService {
  static async getHistory(): Promise<History> {
    const data = await readConfig(HISTORY_FILE)
    if (!data) {
      return { projects: [] }
    }
    return data
  }

  static async saveHistory(history: History): Promise<boolean> {
    return await writeConfig(HISTORY_FILE, history)
  }

  static async addProject(project: HistoryEntry): Promise<boolean> {
    const history = await this.getHistory()
    // Add new project at the beginning (most recent first)
    history.projects = [project, ...history.projects]
    return await this.saveHistory(history)
  }

  static async updateProject(projectId: string, updates: Partial<HistoryEntry>): Promise<boolean> {
    const history = await this.getHistory()
    const projectIndex = history.projects.findIndex(p => p.id === projectId)

    if (projectIndex === -1) {
      return false
    }

    history.projects[projectIndex] = { ...history.projects[projectIndex], ...updates }
    return await this.saveHistory(history)
  }

  static async getProject(projectId: string): Promise<HistoryEntry | null> {
    const history = await this.getHistory()
    return history.projects.find(p => p.id === projectId) || null
  }

  static async deleteProject(projectId: string): Promise<boolean> {
    const history = await this.getHistory()
    const filteredProjects = history.projects.filter(p => p.id !== projectId)

    if (filteredProjects.length === history.projects.length) {
      return false // Project not found
    }

    return await this.saveHistory({ projects: filteredProjects })
  }

  static async getProjectsByStatus(status: 'draft' | 'published' | 'archived'): Promise<HistoryEntry[]> {
    const history = await this.getHistory()
    return history.projects.filter(p => p.status === status)
  }

  static async getAnalytics(): Promise<any> {
    const history = await this.getHistory()

    const analytics = {
      totalProjects: history.projects.length,
      publishedProjects: history.projects.filter(p => p.status === 'published').length,
      draftProjects: history.projects.filter(p => p.status === 'draft').length,
      platformStats: {} as Record<string, any>,
      recentActivity: history.projects.slice(0, 5) // Last 5 projects
    }

    // Calculate platform statistics
    history.projects.forEach(project => {
      project.platforms.forEach(platform => {
        if (!analytics.platformStats[platform]) {
          analytics.platformStats[platform] = { count: 0, projects: [] }
        }
        analytics.platformStats[platform].count++
        analytics.platformStats[platform].projects.push(project.id)
      })
    })

    return analytics
  }
}
