import { createTool, formatToolDescription } from '@/utils/tools.js';
import { z } from 'zod';
import { volumeService } from '@/services/volume.service.js';

export const volumeTools = [
  createTool(
    "volume_list",
    formatToolDescription({
      type: 'API',
      description: "List all volumes in a project",
      bestFor: [
        "Viewing persistent storage configurations",
        "Managing data volumes",
        "Auditing storage usage"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["volume_create"],
        related: ["service_info", "database_deploy"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project to list volumes for")
    },
    async ({ projectId }) => {
      return volumeService.listVolumes(projectId);
    }
  ),

  createTool(
    "volume_create",
    formatToolDescription({
      type: 'API',
      description: "Create a new persistent volume for a service",
      bestFor: [
        "Setting up database storage",
        "Configuring persistent data",
        "Adding file storage"
      ],
      notFor: [
        "Temporary storage needs",
        "Static file hosting",
        "Memory caching"
      ],
      relations: {
        prerequisites: ["service_list"],
        nextSteps: ["volume_list"],
        related: ["service_update", "database_deploy"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project containing the service"),
      environmentId: z.string().describe("ID of the environment for the volume (usually obtained from service_info)"),
      serviceId: z.string().describe("ID of the service to attach volume to"),
      mountPath: z.string().describe("Path where the volume should be mounted in the container")
    },
    async ({ projectId, environmentId, serviceId, mountPath }) => {
      return volumeService.createVolume(projectId, serviceId, environmentId, mountPath);
    }
  ),

  createTool(
    "volume_update",
    "Update a volume's properties",
    {
      volumeId: z.string().describe("ID of the volume to update"),
      name: z.string().describe("New name for the volume")
    },
    async ({ volumeId, name }) => {
      return volumeService.updateVolume(volumeId, name);
    }
  ),

  createTool(
    "volume_delete",
    formatToolDescription({
      type: 'API',
      description: "Delete a volume from a service",
      bestFor: [
        "Removing unused storage",
        "Storage cleanup",
        "Resource management"
      ],
      notFor: [
        "Temporary data removal",
        "Data backup (use volume_backup first)"
      ],
      relations: {
        prerequisites: ["volume_list"],
        related: ["service_update"]
      }
    }),
    {
      volumeId: z.string().describe("ID of the volume to delete")
    },
    async ({ volumeId }) => {
      return volumeService.deleteVolume(volumeId);
    }
  )
]; 