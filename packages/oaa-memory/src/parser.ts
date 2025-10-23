import Ajv from 'ajv';
import { OAAIntent, OAARequirement, OAAConstraint, OAATimeline, OAAMilestone, OAAPhase, OAAResource } from './types';

export class OAAParser {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
  }

  parse(content: string): OAAIntent {
    try {
      // Try to parse as JSON first
      const jsonData = JSON.parse(content);
      return this.parseFromObject(jsonData);
    } catch (jsonError) {
      // If not JSON, try to parse as YAML or other formats
      return this.parseFromText(content);
    }
  }

  private parseFromObject(data: any): OAAIntent {
    const now = new Date().toISOString();
    
    return {
      id: data.id || this.generateId(),
      title: data.title || '',
      description: data.description || '',
      priority: data.priority || 'medium',
      category: data.category || 'general',
      tags: data.tags || [],
      requirements: this.parseRequirements(data.requirements || []),
      constraints: this.parseConstraints(data.constraints || []),
      success_criteria: data.success_criteria || [],
      timeline: this.parseTimeline(data.timeline || {}),
      resources: this.parseResources(data.resources || []),
      dependencies: data.dependencies || [],
      metadata: data.metadata || {},
      created_at: data.created_at || now,
      updated_at: data.updated_at || now
    };
  }

  private parseFromText(text: string): OAAIntent {
    // Basic text parsing - would be enhanced with proper YAML/Markdown parsing
    const lines = text.split('\n');
    const intent: Partial<OAAIntent> = {
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let currentSection = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('# ')) {
        intent.title = trimmed.substring(2);
      } else if (trimmed.startsWith('## ')) {
        currentSection = trimmed.substring(3).toLowerCase().replace(/\s+/g, '_');
      } else if (trimmed.startsWith('- ')) {
        const item = trimmed.substring(2);
        this.addToSection(intent, currentSection, item);
      } else if (trimmed && !trimmed.startsWith('#')) {
        if (currentSection === 'description') {
          intent.description = (intent.description || '') + trimmed + ' ';
        }
      }
    }

    return this.parseFromObject(intent);
  }

  private parseRequirements(requirements: any[]): OAARequirement[] {
    return requirements.map((req, index) => ({
      id: req.id || `req_${index}`,
      description: req.description || '',
      type: req.type || 'functional',
      priority: req.priority || 'should',
      acceptance_criteria: req.acceptance_criteria || [],
      test_cases: req.test_cases || []
    }));
  }

  private parseConstraints(constraints: any[]): OAAConstraint[] {
    return constraints.map((constraint, index) => ({
      id: constraint.id || `constraint_${index}`,
      type: constraint.type || 'technical',
      description: constraint.description || '',
      value: constraint.value || '',
      unit: constraint.unit,
      impact: constraint.impact || 'medium'
    }));
  }

  private parseTimeline(timeline: any): OAATimeline {
    return {
      start_date: timeline.start_date || new Date().toISOString(),
      end_date: timeline.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      milestones: this.parseMilestones(timeline.milestones || []),
      phases: this.parsePhases(timeline.phases || [])
    };
  }

  private parseMilestones(milestones: any[]): OAAMilestone[] {
    return milestones.map((milestone, index) => ({
      id: milestone.id || `milestone_${index}`,
      name: milestone.name || `Milestone ${index + 1}`,
      date: milestone.date || new Date().toISOString(),
      description: milestone.description || '',
      deliverables: milestone.deliverables || [],
      success_criteria: milestone.success_criteria || []
    }));
  }

  private parsePhases(phases: any[]): OAAPhase[] {
    return phases.map((phase, index) => ({
      id: phase.id || `phase_${index}`,
      name: phase.name || `Phase ${index + 1}`,
      start_date: phase.start_date || new Date().toISOString(),
      end_date: phase.end_date || new Date().toISOString(),
      description: phase.description || '',
      activities: phase.activities || [],
      deliverables: phase.deliverables || []
    }));
  }

  private parseResources(resources: any[]): OAAResource[] {
    return resources.map((resource, index) => ({
      id: resource.id || `resource_${index}`,
      type: resource.type || 'human',
      name: resource.name || '',
      description: resource.description || '',
      quantity: resource.quantity || 1,
      unit: resource.unit || 'unit',
      cost: resource.cost,
      availability: resource.availability || 'immediate'
    }));
  }

  private addToSection(intent: Partial<OAAIntent>, section: string, item: string): void {
    switch (section) {
      case 'tags':
        if (!intent.tags) intent.tags = [];
        intent.tags.push(item);
        break;
      case 'success_criteria':
        if (!intent.success_criteria) intent.success_criteria = [];
        intent.success_criteria.push(item);
        break;
      case 'dependencies':
        if (!intent.dependencies) intent.dependencies = [];
        intent.dependencies.push(item);
        break;
    }
  }

  private generateId(): string {
    return `oaa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
