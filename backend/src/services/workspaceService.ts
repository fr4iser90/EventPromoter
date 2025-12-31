// Workspace service for managing current project data

import { Workspace, Project } from '../types/index.js'
import { readConfig, writeConfig } from '../utils/fileUtils.js'

const WORKSPACE_FILE = 'workspace.json'

export class WorkspaceService {
  static async getWorkspace(): Promise<Workspace> {
    const data = await readConfig(WORKSPACE_FILE)
    if (!data) {
      // Return default workspace
      return {
        currentProject: {
          id: `project-${Date.now()}`,
          name: 'New Event Project',
          created: new Date().toISOString(),
          uploadedFiles: [],
          selectedHashtags: [],
          selectedPlatforms: [],
          platformContent: {},
          emailRecipients: [],
          contentTemplates: []
        }
      }
    }
    return data
  }

  static async saveWorkspace(workspace: Workspace): Promise<boolean> {
    return await writeConfig(WORKSPACE_FILE, workspace)
  }

  static async getCurrentProject(): Promise<Project> {
    const workspace = await this.getWorkspace()
    return workspace.currentProject
  }

  static async updateCurrentProject(project: Partial<Project>): Promise<boolean> {
    const workspace = await this.getWorkspace()
    workspace.currentProject = { ...workspace.currentProject, ...project }
    return await this.saveWorkspace(workspace)
  }

  static async resetWorkspace(): Promise<boolean> {
    const defaultWorkspace: Workspace = {
      currentProject: {
        id: `project-${Date.now()}`,
        name: 'New Event Project',
        created: new Date().toISOString(),
        uploadedFiles: [],
        selectedHashtags: [],
        selectedPlatforms: [],
        platformContent: {},
        emailRecipients: [],
        contentTemplates: []
      }
    }
    return await this.saveWorkspace(defaultWorkspace)
  }
}
