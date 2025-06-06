import { BaseService } from './base.service.js';
import { createSuccessResponse, createErrorResponse, formatError } from '@/utils/responses.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { RegionCode } from '@/types.js';
class VolumeService extends BaseService {
  constructor() {
    super();
  }

  /**
   * List all volumes in a project
   * 
   * @param projectId ID of the project
   * @returns CallToolResult with formatted response
   */
  async listVolumes(projectId: string): Promise<CallToolResult> {
    try {
      const volumes = await this.client.volumes.listVolumes(projectId);

      if (volumes.length === 0) {
        return createSuccessResponse({
          text: "No volumes found in this project.",
          data: []
        });
      }

      const volumeDetails = volumes.map(volume => 
        `📦 ${volume.name} (ID: ${volume.id})
Created: ${volume.createdAt ? new Date(volume.createdAt).toLocaleString() : 'N/A'}`
      );

      return createSuccessResponse({
        text: `Volumes in project:\n\n${volumeDetails.join('\n\n')}`,
        data: volumes
      });
    } catch (error) {
      return createErrorResponse(`Error listing volumes: ${formatError(error)}`);
    }
  }

  /**
   * Create a new volume in a project
   * 
   * @param projectId ID of the project where the volume will be created
   * @param serviceId ID of the service to attach the volume to
   * @param environmentId ID of the environment to create the volume in
   * @param mountPath Path to mount the volume on
   * @returns CallToolResult with formatted response
   */
  async createVolume(projectId: string, serviceId: string, environmentId: string, mountPath: string): Promise<CallToolResult> {
    try {
      const input = { projectId, serviceId, environmentId, mountPath };

      const volume = await this.client.volumes.createVolume(input);
      if (!volume) {
        return createErrorResponse(`Error creating volume: Failed to create volume for ${serviceId} in environment ${environmentId}`);
      }
      
      return createSuccessResponse({
        text: `✅ Volume "${volume.name}" created successfully (ID: ${volume.id})`,
        data: volume
      });
    } catch (error) {
      return createErrorResponse(`Error creating volume: ${formatError(error)}`);
    }
  }

  /**
   * Update a volume
   * 
   * @param volumeId ID of the volume to update
   * @param name New name for the volume
   * @returns CallToolResult with formatted response
   */
  async updateVolume(volumeId: string, name: string): Promise<CallToolResult> {
    try {
      const input = { name };
      const volume = await this.client.volumes.updateVolume(volumeId, input);
      
      return createSuccessResponse({
        text: `✅ Volume updated successfully to "${volume.name}" (ID: ${volume.id})`,
        data: volume
      });
    } catch (error) {
      return createErrorResponse(`Error updating volume: ${formatError(error)}`);
    }
  }

  /**
   * Delete a volume
   * 
   * @param volumeId ID of the volume to delete
   * @returns CallToolResult with formatted response
   */
  async deleteVolume(volumeId: string): Promise<CallToolResult> {
    try {
      const success = await this.client.volumes.deleteVolume(volumeId);
      
      if (success) {
        return createSuccessResponse({
          text: "✅ Volume deleted successfully",
          data: { success }
        });
      } else {
        return createErrorResponse("Failed to delete volume");
      }
    } catch (error) {
      return createErrorResponse(`Error deleting volume: ${formatError(error)}`);
    }
  }
}

export const volumeService = new VolumeService(); 