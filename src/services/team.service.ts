import { BaseService } from "./base.service.js";
import { createSuccessResponse, createErrorResponse, formatError } from "../utils/responses.js";

export class TeamService extends BaseService {
  constructor() {
    super();
  }

  async list() {
    try {
      const teams = await this.client.teams.list();
      
      const personalTeams = teams.filter(team => team.isPersonal);
      const organizationTeams = teams.filter(team => !team.isPersonal);

      return createSuccessResponse({
        text: `Found ${teams.length} teams (${personalTeams.length} personal, ${organizationTeams.length} organizations)`,
        data: {
          totalCount: teams.length,
          personalCount: personalTeams.length,
          organizationCount: organizationTeams.length,
          teams: teams.map(team => ({
            id: team.id,
            name: team.name,
            type: team.isPersonal ? 'Personal' : 'Organization',
            avatar: team.avatar,
            createdAt: team.createdAt
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to list teams: ${formatError(error)}`);
    }
  }

  async get(teamId: string) {
    try {
      const team = await this.client.teams.get(teamId);
      const members = await this.client.teams.getMembers(teamId);

      return createSuccessResponse({
        text: `Retrieved team "${team.name}" with ${members.length} members`,
        data: {
          id: team.id,
          name: team.name,
          type: team.isPersonal ? 'Personal' : 'Organization',
          avatar: team.avatar,
          createdAt: team.createdAt,
          updatedAt: team.updatedAt,
          memberCount: members.length,
          members: members.map(member => ({
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role,
            joinedAt: member.joinedAt
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get team: ${formatError(error)}`);
    }
  }

  async create(name: string, avatar?: string) {
    try {
      const team = await this.client.teams.create({ name, avatar });

      return createSuccessResponse({
        text: `Team "${team.name}" created successfully`,
        data: {
          id: team.id,
          name: team.name,
          type: team.isPersonal ? 'Personal' : 'Organization',
          avatar: team.avatar,
          createdAt: team.createdAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to create team: ${formatError(error)}`);
    }
  }

  async update(teamId: string, name?: string, avatar?: string) {
    try {
      const team = await this.client.teams.update(teamId, { name, avatar });

      return createSuccessResponse({
        text: `Team updated successfully`,
        data: {
          id: team.id,
          name: team.name,
          avatar: team.avatar,
          updatedAt: team.updatedAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to update team: ${formatError(error)}`);
    }
  }

  async delete(teamId: string) {
    try {
      const success = await this.client.teams.delete(teamId);
      
      if (success) {
        return createSuccessResponse({
          text: "Team deleted successfully"
        });
      } else {
        return createErrorResponse("Failed to delete team");
      }
    } catch (error) {
      return createErrorResponse(`Failed to delete team: ${formatError(error)}`);
    }
  }

  async invite(teamId: string, email: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER') {
    try {
      const invite = await this.client.teams.invite(teamId, { email, role });

      return createSuccessResponse({
        text: `Invitation sent to ${email} as ${role}`,
        data: {
          id: invite.id,
          email: invite.email,
          role: invite.role,
          createdAt: invite.createdAt,
          expiresAt: invite.expiresAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to send team invitation: ${formatError(error)}`);
    }
  }

  async removeMember(teamId: string, userId: string) {
    try {
      const success = await this.client.teams.removeMember(teamId, userId);
      
      if (success) {
        return createSuccessResponse({
          text: "Member removed from team successfully"
        });
      } else {
        return createErrorResponse("Failed to remove member from team");
      }
    } catch (error) {
      return createErrorResponse(`Failed to remove team member: ${formatError(error)}`);
    }
  }

  async updateMemberRole(teamId: string, userId: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER') {
    try {
      const member = await this.client.teams.updateMemberRole(teamId, userId, role);

      return createSuccessResponse({
        text: `Updated ${member.name}'s role to ${role}`,
        data: {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to update member role: ${formatError(error)}`);
    }
  }

  async getMembers(teamId: string) {
    try {
      const members = await this.client.teams.getMembers(teamId);

      const roleGroups = members.reduce((acc, member) => {
        if (!acc[member.role]) acc[member.role] = [];
        acc[member.role].push(member);
        return acc;
      }, {} as Record<string, typeof members>);

      return createSuccessResponse({
        text: `Team has ${members.length} members`,
        data: {
          totalCount: members.length,
          byRole: roleGroups,
          members: members.map(member => ({
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role,
            joinedAt: member.joinedAt,
            avatar: member.avatar
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get team members: ${formatError(error)}`);
    }
  }
}

export const teamService = new TeamService();