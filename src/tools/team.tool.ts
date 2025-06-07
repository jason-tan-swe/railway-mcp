import { z } from "zod";
import { createTool, formatToolDescription } from "../utils/tools.js";
import { teamService } from "../services/team.service.js";

export const teamTools = [
  createTool(
    "team-list",
    formatToolDescription({
      type: 'QUERY',
      description: "List all teams (personal and organizations)",
      bestFor: [
        "Viewing available teams",
        "Switching between organizations",
        "Team overview"
      ],
      relations: {
        nextSteps: ["team-get", "team-create", "project_list"]
      }
    }),
    {},
    async () => {
      return teamService.list();
    }
  ),

  createTool(
    "team-get",
    formatToolDescription({
      type: 'QUERY',
      description: "Get detailed information about a team",
      bestFor: [
        "Viewing team details and members",
        "Checking team permissions",
        "Team administration"
      ],
      relations: {
        prerequisites: ["team-list"],
        nextSteps: ["team-members", "team-invite", "team-update"]
      }
    }),
    {
      teamId: z.string().describe("ID of the team")
    },
    async ({ teamId }) => {
      return teamService.get(teamId);
    }
  ),

  createTool(
    "team-create",
    formatToolDescription({
      type: 'API',
      description: "Create a new organization team",
      bestFor: [
        "Creating new organizations",
        "Setting up team workspaces",
        "Organizing projects by team"
      ],
      notFor: [
        "Personal accounts (automatically created)"
      ],
      relations: {
        nextSteps: ["team-invite", "project_create", "team-get"]
      }
    }),
    {
      name: z.string().describe("Name of the team/organization"),
      avatar: z.string().optional().describe("URL to team avatar image")
    },
    async ({ name, avatar }) => {
      return teamService.create(name, avatar);
    }
  ),

  createTool(
    "team-update",
    formatToolDescription({
      type: 'API',
      description: "Update team name or avatar",
      bestFor: [
        "Rebranding teams",
        "Updating team information",
        "Changing team avatar"
      ],
      relations: {
        prerequisites: ["team-get"],
        nextSteps: ["team-get"]
      }
    }),
    {
      teamId: z.string().describe("ID of the team"),
      name: z.string().optional().describe("New team name"),
      avatar: z.string().optional().describe("New avatar URL")
    },
    async ({ teamId, name, avatar }) => {
      return teamService.update(teamId, name, avatar);
    }
  ),

  createTool(
    "team-delete",
    formatToolDescription({
      type: 'API',
      description: "Delete a team (WARNING: This will delete all projects)",
      bestFor: [
        "Removing unused organizations"
      ],
      notFor: [
        "Personal teams (cannot be deleted)",
        "Active teams with important projects"
      ],
      relations: {
        prerequisites: ["team-get"],
        alternatives: ["project_delete"]
      }
    }),
    {
      teamId: z.string().describe("ID of the team to delete")
    },
    async ({ teamId }) => {
      return teamService.delete(teamId);
    }
  ),

  createTool(
    "team-members",
    formatToolDescription({
      type: 'QUERY',
      description: "List all members of a team",
      bestFor: [
        "Viewing team membership",
        "Checking member roles",
        "Team administration"
      ],
      relations: {
        prerequisites: ["team-get"],
        nextSteps: ["team-invite", "team-member-role-update", "team-member-remove"]
      }
    }),
    {
      teamId: z.string().describe("ID of the team")
    },
    async ({ teamId }) => {
      return teamService.getMembers(teamId);
    }
  ),

  createTool(
    "team-invite",
    formatToolDescription({
      type: 'API',
      description: "Invite a user to join the team",
      bestFor: [
        "Adding new team members",
        "Inviting collaborators",
        "Growing teams"
      ],
      relations: {
        prerequisites: ["team-get"],
        nextSteps: ["team-members"]
      }
    }),
    {
      teamId: z.string().describe("ID of the team"),
      email: z.string().email().describe("Email address of the user to invite"),
      role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).describe("Role to assign to the invited user")
    },
    async ({ teamId, email, role }) => {
      return teamService.invite(teamId, email, role);
    }
  ),

  createTool(
    "team-member-remove",
    formatToolDescription({
      type: 'API',
      description: "Remove a member from the team",
      bestFor: [
        "Removing team members",
        "Managing team access",
        "Cleanup after role changes"
      ],
      relations: {
        prerequisites: ["team-members"],
        nextSteps: ["team-members"]
      }
    }),
    {
      teamId: z.string().describe("ID of the team"),
      userId: z.string().describe("ID of the user to remove")
    },
    async ({ teamId, userId }) => {
      return teamService.removeMember(teamId, userId);
    }
  ),

  createTool(
    "team-member-role-update",
    formatToolDescription({
      type: 'API',
      description: "Update a team member's role",
      bestFor: [
        "Promoting team members",
        "Changing permissions",
        "Role management"
      ],
      relations: {
        prerequisites: ["team-members"],
        nextSteps: ["team-members"]
      }
    }),
    {
      teamId: z.string().describe("ID of the team"),
      userId: z.string().describe("ID of the user"),
      role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).describe("New role for the user")
    },
    async ({ teamId, userId, role }) => {
      return teamService.updateMemberRole(teamId, userId, role);
    }
  )
];