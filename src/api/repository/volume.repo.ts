import { RailwayApiClient } from '@/api/api-client.js';
import { Volume, VolumeCreateInput, VolumeUpdateInput } from '@/types.js';

export class VolumeRepository {
  constructor(private client: RailwayApiClient) {}

  async createVolume(input: VolumeCreateInput): Promise<Volume> {
    const data = await this.client.request<{ volumeCreate: Volume }>(`
      mutation volumeCreate($input: VolumeCreateInput!) {
        volumeCreate(input: $input) {
          createdAt
          id
          name
          projectId
        }
      }
    `, { input });

    return data.volumeCreate;
  }

  async updateVolume(volumeId: string, input: VolumeUpdateInput): Promise<Volume> {
    const data = await this.client.request<{ volumeUpdate: Volume }>(`
      mutation volumeUpdate($input: VolumeUpdateInput!, $volumeId: String!) {
        volumeUpdate(input: $input, volumeId: $volumeId) {
          createdAt
          id
          name
          projectId
        }
      }
    `, { input, volumeId });

    return data.volumeUpdate;
  }

  async deleteVolume(volumeId: string): Promise<boolean> {
    const data = await this.client.request<{ volumeDelete: boolean }>(`
      mutation volumeDelete($volumeId: String!) {
        volumeDelete(volumeId: $volumeId)
      }
    `, { volumeId });

    return data.volumeDelete;
  }

  async listVolumes(projectId: string): Promise<Volume[]> {
    const data = await this.client.request<{ project: { volumes: { edges: { node: Volume }[] } } }>(`
      query project($projectId: String!) {
        project(id: $projectId) {
          volumes {
            edges {
              node {
                createdAt
                id
                name
                projectId
                volumeInstances(first: 5) {
                  edges {
                    node {
                      createdAt
                      id
                      mountPath
                      state
                    }
                  }
                }
              }
            }
          }
        }
      }
    `, { projectId });

    return data.project.volumes.edges.map(edge => edge.node);
  }
} 