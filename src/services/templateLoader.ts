import { 
  GoalTemplate, 
  TemplateCollection, 
  TemplateValidationResult, 
  GoalCategory,
  GoalPriority 
} from '../types/goal';
import goalTemplatesCollection from '../data/goal-templates';

/**
 * Template Loader Service
 * Handles loading, validation, and management of goal templates from JSON files
 */
class TemplateLoaderService {
  private templates: GoalTemplate[] = [];
  private isLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  /**
   * Load templates from JSON file with validation and error handling
   */
  async loadTemplates(): Promise<void> {
    // Prevent multiple simultaneous loads
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    if (this.isLoaded) {
      return;
    }

    this.loadingPromise = this._performLoad();
    return this.loadingPromise;
  }

  private async _performLoad(): Promise<void> {
    try {
      console.log('🔄 Loading goal templates from static import...');
      
      // Static import - Mobile compatible
      const collection: TemplateCollection = goalTemplatesCollection;

      // Validate the loaded data
      const validation = this.validateTemplateCollection(collection);
      if (!validation.isValid) {
        console.error('❌ Template validation failed:', validation.errors);
        // Use fallback templates in case of validation errors
        this.templates = this.getFallbackTemplates();
        return;
      }

      // Process and store templates
      this.templates = collection.templates.map(template => this.processTemplate(template));
      this.isLoaded = true;

      console.log(`✅ Successfully loaded ${this.templates.length} goal templates`);
      console.log('📊 Template categories:', [...new Set(this.templates.map(t => t.category))]);

    } catch (error) {
      console.error('❌ Error loading templates:', error);
      console.log('🔄 Using fallback templates...');
      this.templates = this.getFallbackTemplates();
    } finally {
      this.loadingPromise = null;
    }
  }

  /**
   * Validate template collection structure and content
   */
  private validateTemplateCollection(collection: any): TemplateValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check basic structure
    if (!collection || typeof collection !== 'object') {
      errors.push('Invalid template collection structure');
      return { isValid: false, errors, warnings };
    }

    if (!Array.isArray(collection.templates)) {
      errors.push('Templates array is missing or invalid');
      return { isValid: false, errors, warnings };
    }

    // Validate each template
    collection.templates.forEach((template: any, index: number) => {
      const templateErrors = this.validateTemplate(template, index);
      errors.push(...templateErrors);
    });

    // Check for duplicate template IDs
    const templateIds = collection.templates.map((t: any) => t.id).filter(Boolean);
    const duplicateIds = templateIds.filter((id: string, index: number) => templateIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate template IDs found: ${duplicateIds.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate individual template structure
   */
  private validateTemplate(template: any, index: number): string[] {
    const errors: string[] = [];
    const prefix = `Template ${index + 1}`;

    // Required fields
    const requiredFields = ['id', 'name', 'description', 'category', 'icon', 'color'];
    requiredFields.forEach(field => {
      if (!template[field] || typeof template[field] !== 'string') {
        errors.push(`${prefix}: Missing or invalid ${field}`);
      }
    });

    // Validate arrays
    if (!Array.isArray(template.templateTasks)) {
      errors.push(`${prefix}: templateTasks must be an array`);
    }

    if (!Array.isArray(template.templateHabits)) {
      errors.push(`${prefix}: templateHabits must be an array`);
    }

    // Validate category
    const validCategories: GoalCategory[] = ['health', 'career', 'learning', 'finance', 'relationships', 'personal', 'creative'];
    if (template.category && !validCategories.includes(template.category)) {
      errors.push(`${prefix}: Invalid category "${template.category}"`);
    }

    // Validate priority in tasks and habits
    if (template.templateTasks) {
      template.templateTasks.forEach((task: any, taskIndex: number) => {
        if (task.priority) {
          const validPriorities: GoalPriority[] = ['low', 'medium', 'high', 'critical'];
          if (!validPriorities.includes(task.priority)) {
            errors.push(`${prefix}, Task ${taskIndex + 1}: Invalid priority "${task.priority}"`);
          }
        }
      });
    }

    return errors;
  }

  /**
   * Process template to ensure all required fields and proper formatting
   */
  private processTemplate(template: any): GoalTemplate {
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      icon: template.icon,
      color: template.color,
      estimatedDuration: template.estimatedDuration || 'Not specified',
      difficulty: template.difficulty || 'intermediate',
      popularity: template.popularity || 'medium',
      isPopular: template.isPopular || false,
      tags: template.tags || [],
      templateTasks: template.templateTasks || [],
      templateHabits: template.templateHabits || [],
      userCount: template.userCount,
      realWorldValidation: template.realWorldValidation
    };
  }

  /**
   * Get all loaded templates
   */
  async getTemplates(): Promise<GoalTemplate[]> {
    await this.loadTemplates();
    return [...this.templates];
  }

  /**
   * Get template by ID
   */
  async getTemplateById(id: string): Promise<GoalTemplate | undefined> {
    await this.loadTemplates();
    return this.templates.find(template => template.id === id);
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: GoalCategory): Promise<GoalTemplate[]> {
    await this.loadTemplates();
    return this.templates.filter(template => template.category === category);
  }

  /**
   * Get popular templates
   */
  async getPopularTemplates(): Promise<GoalTemplate[]> {
    await this.loadTemplates();
    return this.templates.filter(template => template.isPopular);
  }

  /**
   * Fallback templates in case JSON loading fails
   */
  private getFallbackTemplates(): GoalTemplate[] {
    return [
      {
        id: 'health-fitness-fallback',
        name: 'Get Fit & Strong',
        description: 'Build a consistent workout routine and develop healthy eating habits.',
        category: 'health',
        icon: '💪',
        color: 'linear-gradient(135deg, #10B981, #22C55E)',
        estimatedDuration: '3-6 months',
        difficulty: 'intermediate',
        popularity: 'high',
        isPopular: true,
        tags: ['fitness', 'health', 'strength'],
        templateTasks: [
          { 
            id: '1', 
            name: 'Set up workout routine', 
            priority: 'high',
            description: 'Create a structured workout schedule',
            category: 'preparation'
          }
        ],
        templateHabits: [
          { 
            id: '1', 
            name: 'Daily exercise', 
            icon: '🏃', 
            measurementType: 'simple', 
            frequency: 'daily',
            description: 'Complete daily workout or physical activity'
          }
        ]
      }
    ];
  }

  /**
   * Reload templates (useful for development or template updates)
   */
  async reloadTemplates(): Promise<void> {
    this.isLoaded = false;
    this.loadingPromise = null;
    this.templates = [];
    await this.loadTemplates();
  }

  /**
   * Get template statistics
   */
  async getTemplateStats() {
    await this.loadTemplates();
    
    const categories = [...new Set(this.templates.map(t => t.category))];
    const difficulties = this.templates.reduce((acc, t) => {
      acc[t.difficulty] = (acc[t.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTemplates: this.templates.length,
      categories: categories.length,
      popularTemplates: this.templates.filter(t => t.isPopular).length,
      byDifficulty: difficulties,
      byCategory: categories.reduce((acc, cat) => {
        acc[cat] = this.templates.filter(t => t.category === cat).length;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

// Export singleton instance
export const templateLoader = new TemplateLoaderService();
export default templateLoader;