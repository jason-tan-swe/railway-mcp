import { BaseApiClient } from '../base-client.js';

export interface Team {
  id: string;
  name: string;
  avatar?: string;
  isPersonal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  joinedAt: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
  createdAt: string;
  expiresAt: string;
}

export interface TeamCreateInput {
  name: string;
  avatar?: string;
}

export interface TeamUpdateInput {
  name?: string;
  avatar?: string;
}

export interface TeamInviteInput {
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export class TeamRepository {
  constructor(private client: BaseApiClient) {}

  async list(): Promise<Team[]> {
    const query = `
      query {
        teams {
          edges {
            node {
              id
              name
              avatar
              isPersonal
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      teams: { edges: Array<{ node: Team }> };
    }>(query);

    return response.teams.edges.map(edge => edge.node);
  }

  async get(teamId: string): Promise<Team> {
    const query = `
      query getTeam($teamId: String!) {
        team(id: $teamId) {
          id
          name
          avatar
          isPersonal
          createdAt
          updatedAt
        }
      }
    `;

    const response = await this.client.request<{ team: Team }>(query, { teamId });
    return response.team;
  }

  async create(input: TeamCreateInput): Promise<Team> {
    const query = `
      mutation teamCreate($input: TeamCreateInput!) {
        teamCreate(input: $input) {
          id
          name
          avatar
          isPersonal
          createdAt
          updatedAt
        }
      }
    `;

    const response = await this.client.request<{ teamCreate: Team }>(query, { input });
    return response.teamCreate;
  }

  async update(teamId: string, input: TeamUpdateInput): Promise<Team> {
    const query = `
      mutation teamUpdate($teamId: String!, $input: TeamUpdateInput!) {
        teamUpdate(id: $teamId, input: $input) {
          id
          name
          avatar
          isPersonal
          createdAt
          updatedAt
        }
      }
    `;

    const response = await this.client.request<{ teamUpdate: Team }>(query, { teamId, input });
    return response.teamUpdate;
  }

  async delete(teamId: string): Promise<boolean> {
    const query = `
      mutation teamDelete($teamId: String!) {
        teamDelete(id: $teamId)
      }
    `;

    const response = await this.client.request<{ teamDelete: boolean }>(query, { teamId });
    return response.teamDelete;
  }

  async getMembers(teamId: string): Promise<TeamMember[]> {
    const query = `
      query getTeamMembers($teamId: String!) {
        teamMembers(teamId: $teamId) {
          edges {
            node {
              id
              name
              email
              avatar
              role
              joinedAt
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      teamMembers: { edges: Array<{ node: TeamMember }> };
    }>(query, { teamId });

    return response.teamMembers.edges.map(edge => edge.node);
  }

  async invite(teamId: string, input: TeamInviteInput): Promise<TeamInvite> {
    const query = `
      mutation teamInviteUser($teamId: String!, $input: TeamInviteInput!) {
        teamInviteUser(teamId: $teamId, input: $input) {
          id
          email
          role
          createdAt
          expiresAt
        }
      }
    `;

    const response = await this.client.request<{ teamInviteUser: TeamInvite }>(query, { teamId, input });
    return response.teamInviteUser;
  }

  async removeMember(teamId: string, userId: string): Promise<boolean> {
    const query = `
      mutation teamRemoveMember($teamId: String!, $userId: String!) {
        teamRemoveMember(teamId: $teamId, userId: $userId)
      }
    `;

    const response = await this.client.request<{ teamRemoveMember: boolean }>(query, { teamId, userId });
    return response.teamRemoveMember;
  }

  async updateMemberRole(teamId: string, userId: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER'): Promise<TeamMember> {
    const query = `
      mutation teamUpdateMemberRole($teamId: String!, $userId: String!, $role: TeamRole!) {
        teamUpdateMemberRole(teamId: $teamId, userId: $userId, role: $role) {
          id
          name
          email
          avatar
          role
          joinedAt
        }
      }
    `;

    const response = await this.client.request<{ teamUpdateMemberRole: TeamMember }>(query, { teamId, userId, role });
    return response.teamUpdateMemberRole;
  }
}