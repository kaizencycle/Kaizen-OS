# Change Specification

## Overview
**Title:** {{title}}  
**Chamber:** {{chamber}}  
**Cycle:** {{cycle}}  
**Author:** {{author}}  
**Date:** {{timestamp}}  

## Motivation
{{motivation}}

## Scope
{{#each scope}}
- {{this}}
{{/each}}

## Technical Requirements

### API Changes
- [ ] New endpoints defined
- [ ] Request/response schemas documented
- [ ] Authentication/authorization specified

### Database Changes
- [ ] Schema migrations defined
- [ ] Data migration scripts created
- [ ] Rollback procedures documented

### Frontend Changes
- [ ] UI components designed
- [ ] State management updated
- [ ] Error handling implemented

## Risk Assessment
**Level:** {{risk}}  
**Mitigation:** {{rollback}}

## Acceptance Criteria
- [ ] All tests pass
- [ ] Security scan clean
- [ ] Performance within SLO
- [ ] Documentation updated

## Citations
{{#each citations}}
- [{{url}}]({{url}}) ({{hash}})
{{/each}}

## Integrity Anchor
`{{integrity_anchor}}`