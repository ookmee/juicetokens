# JuiceTokens Developmental Stage Tracking System

This module implements the Developmental Stage Tracking system as defined in the JuiceTokens Protocol Definition Document (section 5.3). It provides TypeScript adapters for tracking user progression through seven developmental stages: Trust, Autonomy, Imagination, Competence, Identity, Connection, and Generativity.

## Overview

The Developmental Stage system tracks a user's progress through distinct developmental stages, each representing a different phase of their journey within the JuiceTokens ecosystem. Users start at the Trust stage and can progress through to the Generativity stage by completing activities, reaching milestones, and demonstrating mastery of each stage.

## Implementation

The implementation consists of the following key components:

### 1. TypeScript Types (`developmental_stage_types.ts`)

TypeScript interfaces that map to the protocol buffer definitions in `protos/lifecycle/developmental_stage.proto`:

- `DevelopmentalStageLevel` - Enum for the seven developmental stages
- `IStageMetric` - Interface for tracking metrics for a specific stage
- `IStageTransition` - Interface for recording transitions between stages
- `IUserDevelopmentalStageStatus` - Interface for tracking a user's overall stage status
- `IDevelopmentalStageActivity` - Interface for defining activities that contribute to stage progression
- `IActivityCompletion` - Interface for recording activity completions
- `IStageProgressionRecommendation` - Interface for recommending actions to advance in a stage
- `IDevelopmentalStageChallenge` - Interface for defining challenges for stage advancement
- `IStageMilestone` - Interface for defining milestones within each stage

### 2. Adapter Class (`DevelopmentalStageAdapter.ts`)

The `DevelopmentalStageAdapter` class provides methods for:

- Initializing a user's developmental stage status
- Recording activity completions
- Managing stage transitions
- Calculating stage metrics (progress, mastery)
- Generating progression recommendations
- Validating and recording milestone completions

### 3. Tests (`tests/DevelopmentalStageAdapter.test.ts`)

Comprehensive tests that demonstrate:

- User initialization
- Activity completion
- Stage transition
- Stage progression through multiple activities
- Milestone completion
- Stage progression recommendations

### 4. Example Implementation (`examples/DevelopmentalStageExample.ts`)

A complete example showing how to use the Developmental Stage system, including:

- User initialization
- Defining activities and milestones
- Recording activity completions
- Completing milestones
- Transitioning between stages
- Generating progression recommendations

## Key Features

### Stage Progression Logic

Users progress through stages by:

1. Completing activities relevant to their current stage
2. Reaching sufficient progress and mastery in their current stage
3. Completing transition milestones

### Metrics Calculation

The system calculates several metrics for each stage:

- **Progress**: Based on experience points earned relative to the requirements for the stage
- **Mastery Score**: A weighted combination of progress, activities completed, and milestones completed
- **Experience Points**: Earned by completing activities and milestones

### Primary and Secondary Stages

Each user has:

- **Primary Stage**: The main stage they are currently in
- **Secondary Stage**: Usually the previous stage, providing continuity in the developmental journey

Activities can contribute to both primary and secondary stages, with configurable contribution weights.

### Stage Transitions

Transitions between stages:

- Require minimum progress and mastery thresholds
- Must be sequential (no skipping stages)
- Are recorded with timestamps, signatures, and optional witnesses
- Can be triggered by milestone completions

## Usage

Here's a simple example of how to use the Developmental Stage adapter:

```typescript
import { 
  DevelopmentalStageAdapter, 
  DevelopmentalStageLevel 
} from '../lifecycle';

// Initialize the adapter
const stageAdapter = new DevelopmentalStageAdapter();

// Initialize a user
const userId = 'user-123';
const userStatus = stageAdapter.initializeUserStage(userId).data;

// Define an activity
const activity = {
  activityId: 'trust-activity-1',
  activityName: 'Trust Building Exercise',
  description: 'An activity to build trust',
  primaryStage: DevelopmentalStageLevel.TRUST,
  secondaryStages: [],
  experiencePoints: 100,
  repeatable: true,
  cooldownHours: 0,
  attributeMultipliers: new Map()
};

// Record activity completion
const result = stageAdapter.recordActivityCompletion(userStatus, activity);
const updatedStatus = result.data.userStatus;

// Generate recommendations
const recommendations = stageAdapter.generateProgressionRecommendations(
  updatedStatus,
  [activity]
).data;

console.log(`Current stage: ${DevelopmentalStageLevel[updatedStatus.currentPrimaryStage]}`);
console.log(`Progress: ${recommendations.currentProgress * 100}%`);
console.log(`Guidance: ${recommendations.personalizedGuidance}`);
```

## Integration with Protocol Buffers

This implementation adapts the protocol buffer definitions from `protos/lifecycle/developmental_stage.proto` to TypeScript, providing a type-safe way to interact with the Developmental Stage Tracking System.

The TypeScript adapter classes work with these protocol buffer definitions rather than creating new ones, ensuring compatibility with the broader JuiceTokens ecosystem. 