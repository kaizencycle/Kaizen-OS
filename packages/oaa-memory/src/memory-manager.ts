import { OAAIntent, OAAMemory, OAATemplate, OAAPattern, OAASchema } from './types';

export class OAAMemoryManager {
  private memory: OAAMemory;

  constructor() {
    this.memory = {
      intents: [],
      templates: [],
      patterns: [],
      schemas: []
    };
  }

  // Intent management
  addIntent(intent: OAAIntent): void {
    const existingIndex = this.memory.intents.findIndex(i => i.id === intent.id);
    if (existingIndex >= 0) {
      this.memory.intents[existingIndex] = intent;
    } else {
      this.memory.intents.push(intent);
    }
  }

  getIntent(id: string): OAAIntent | undefined {
    return this.memory.intents.find(intent => intent.id === id);
  }

  listIntents(filter?: Partial<OAAIntent>): OAAIntent[] {
    if (!filter) return this.memory.intents;
    
    return this.memory.intents.filter(intent => {
      return Object.entries(filter).every(([key, value]) => {
        return intent[key as keyof OAAIntent] === value;
      });
    });
  }

  removeIntent(id: string): boolean {
    const index = this.memory.intents.findIndex(intent => intent.id === id);
    if (index >= 0) {
      this.memory.intents.splice(index, 1);
      return true;
    }
    return false;
  }

  // Template management
  addTemplate(template: OAATemplate): void {
    const existingIndex = this.memory.templates.findIndex(t => t.id === template.id);
    if (existingIndex >= 0) {
      this.memory.templates[existingIndex] = template;
    } else {
      this.memory.templates.push(template);
    }
  }

  getTemplate(id: string): OAATemplate | undefined {
    return this.memory.templates.find(template => template.id === id);
  }

  listTemplates(category?: string): OAATemplate[] {
    if (!category) return this.memory.templates;
    return this.memory.templates.filter(template => template.category === category);
  }

  // Pattern management
  addPattern(pattern: OAAPattern): void {
    const existingIndex = this.memory.patterns.findIndex(p => p.id === pattern.id);
    if (existingIndex >= 0) {
      this.memory.patterns[existingIndex] = pattern;
    } else {
      this.memory.patterns.push(pattern);
    }
  }

  getPattern(id: string): OAAPattern | undefined {
    return this.memory.patterns.find(pattern => pattern.id === id);
  }

  searchPatterns(query: string): OAAPattern[] {
    const lowercaseQuery = query.toLowerCase();
    return this.memory.patterns.filter(pattern => 
      pattern.name.toLowerCase().includes(lowercaseQuery) ||
      pattern.description.toLowerCase().includes(lowercaseQuery) ||
      pattern.pattern.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Schema management
  addSchema(schema: OAASchema): void {
    const existingIndex = this.memory.schemas.findIndex(s => s.id === schema.id);
    if (existingIndex >= 0) {
      this.memory.schemas[existingIndex] = schema;
    } else {
      this.memory.schemas.push(schema);
    }
  }

  getSchema(id: string): OAASchema | undefined {
    return this.memory.schemas.find(schema => schema.id === id);
  }

  listSchemas(version?: string): OAASchema[] {
    if (!version) return this.memory.schemas;
    return this.memory.schemas.filter(schema => schema.version === version);
  }

  // Memory operations
  getMemory(): OAAMemory {
    return { ...this.memory };
  }

  clearMemory(): void {
    this.memory = {
      intents: [],
      templates: [],
      patterns: [],
      schemas: []
    };
  }

  exportMemory(): string {
    return JSON.stringify(this.memory, null, 2);
  }

  importMemory(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      if (this.validateMemoryStructure(imported)) {
        this.memory = imported;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private validateMemoryStructure(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.intents) &&
      Array.isArray(data.templates) &&
      Array.isArray(data.patterns) &&
      Array.isArray(data.schemas)
    );
  }

  // Statistics
  getStats(): {
    intents: number;
    templates: number;
    patterns: number;
    schemas: number;
    categories: string[];
  } {
    const categories = new Set<string>();
    this.memory.intents.forEach(intent => {
      if (intent.category) categories.add(intent.category);
    });
    this.memory.templates.forEach(template => {
      if (template.category) categories.add(template.category);
    });
    this.memory.patterns.forEach(pattern => {
      if (pattern.category) categories.add(pattern.category);
    });

    return {
      intents: this.memory.intents.length,
      templates: this.memory.templates.length,
      patterns: this.memory.patterns.length,
      schemas: this.memory.schemas.length,
      categories: Array.from(categories)
    };
  }
}
