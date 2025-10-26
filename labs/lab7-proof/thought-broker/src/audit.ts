import { ThoughtMessage, LoopState } from './types.js';
import { SafetyGuards } from './guards.js';

export class AuditLogger {
  private static logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info';

  static setLogLevel(level: 'debug' | 'info' | 'warn' | 'error') {
    this.logLevel = level;
  }

  static logLoopStart(loopId: string, cycle: string, goal: string) {
    this.log('info', 'loop_start', {
      loopId,
      cycle,
      goal: goal.substring(0, 100) + (goal.length > 100 ? '...' : ''),
      timestamp: new Date().toISOString()
    });
  }

  static logMessage(loopId: string, message: ThoughtMessage, step: number) {
    const sanitizedContent = SafetyGuards.sanitizeForLogging(message.content);
    
    this.log('debug', 'message_generated', {
      loopId,
      step,
      role: message.role,
      from: message.from,
      content: sanitizedContent,
      score: message.score,
      citations: message.citations?.length || 0,
      timestamp: new Date().toISOString()
    });
  }

  static logConsensus(loopId: string, consensus: any, score: number) {
    this.log('info', 'consensus_reached', {
      loopId,
      score,
      summary: consensus.summary?.substring(0, 200) + (consensus.summary?.length > 200 ? '...' : ''),
      citations: consensus.citations?.length || 0,
      riskNotes: consensus.riskNotes?.length || 0,
      timestamp: new Date().toISOString()
    });
  }

  static logLoopHalt(loopId: string, reason: string, finalScore: number, steps: number) {
    this.log('info', 'loop_halted', {
      loopId,
      reason,
      finalScore,
      steps,
      duration: Date.now(), // Will be calculated by caller
      timestamp: new Date().toISOString()
    });
  }

  static logError(loopId: string, error: Error, context: string) {
    this.log('error', 'loop_error', {
      loopId,
      error: error.message,
      context,
      stack: error.stack?.substring(0, 500),
      timestamp: new Date().toISOString()
    });
  }

  static logDispatch(loopId: string, repo: string, branch: string, success: boolean) {
    this.log('info', 'cursor_dispatch', {
      loopId,
      repo,
      branch,
      success,
      timestamp: new Date().toISOString()
    });
  }

  static logAttestation(loopId: string, attestRef: string, success: boolean) {
    this.log('info', 'ledger_attestation', {
      loopId,
      attestRef,
      success,
      timestamp: new Date().toISOString()
    });
  }

  private static log(level: string, event: string, data: any) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = levels[this.logLevel as keyof typeof levels];
    const eventLevel = levels[level as keyof typeof levels];

    if (eventLevel >= currentLevel) {
      console.log(JSON.stringify({
        level,
        event,
        ...data
      }));
    }
  }

  static generateAuditTrail(state: LoopState): string {
    const trail = {
      loopId: state.id,
      cycle: state.cycle,
      status: state.status,
      steps: state.step,
      duration: state.lastUpdatedAt - state.startedAt,
      messages: state.messages.map(msg => ({
        role: msg.role,
        from: msg.from,
        score: msg.score,
        citations: msg.citations?.length || 0,
        content: SafetyGuards.sanitizeForLogging(msg.content)
      })),
      consensus: state.consensus ? {
        score: state.consensus.score,
        summary: state.consensus.summary,
        citations: state.consensus.citations.length,
        riskNotes: state.consensus.riskNotes.length
      } : null,
      attestRef: state.attestRef
    };

    return JSON.stringify(trail, null, 2);
  }
}
