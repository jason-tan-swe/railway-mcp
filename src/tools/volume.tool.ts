import { z } from 'zod';
import { createTool } from '@/utils/tools.js';
import { volumeService } from '@/services/volume.service.js';

export const volumeTools = [
  createTool(
    "volume_list",
    "List all volumes in a project",
    {
      projectId: z.string().describe("ID of the project to list volumes for")
    },
    async ({ projectId }) => {
      return volumeService.listVolumes(projectId);
    }
  ),

  createTool(
    "volume_create",
    "Create a new volume in a project",
    {
      projectId: z.string().describe("ID of the project to create the volume in"),
      serviceId: z.string().describe("ID of the service to attach the volume to"),
      environmentId: z.string().describe("ID of the environment to create the volume in"),
      mountPath: z.string().describe("Path to mount the volume on")
    },
    async ({ projectId, serviceId, environmentId, mountPath }) => {
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
    "Delete a volume",
    {
      volumeId: z.string().describe("ID of the volume to delete")
    },
    async ({ volumeId }) => {
      return volumeService.deleteVolume(volumeId);
    }
  )
]; 