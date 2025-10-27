"""Workshop API endpoints."""

import logging
import os
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from server.database import WorkshopDB, get_db
from server.models import (
  Annotation,
  AnnotationCreate,
  DiscoveryFinding,
  DiscoveryFindingCreate,
  IRRResult,
  JudgeEvaluation,
  JudgeEvaluationDirectRequest,
  JudgeEvaluationRequest,
  JudgeEvaluationResult,
  JudgeExportConfig,
  JudgePerformanceMetrics,
  JudgePrompt,
  JudgePromptCreate,
  MLflowIntakeConfig,
  MLflowIntakeConfigCreate,
  MLflowIntakeStatus,
  MLflowTraceInfo,
  Rubric,
  RubricCreate,
  Trace,
  TraceUpload,
  Workshop,
  WorkshopCreate,
  WorkshopPhase,
)
from server.services.database_service import DatabaseService
from server.services.irr_service import calculate_irr_for_workshop

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post('/', status_code=status.HTTP_201_CREATED)
async def create_workshop(workshop_data: WorkshopCreate, db: Session = Depends(get_db)) -> Workshop:
  """Create a new workshop."""
  db_service = DatabaseService(db)
  return db_service.create_workshop(workshop_data)


@router.get('/{workshop_id}')
async def get_workshop(workshop_id: str, db: Session = Depends(get_db)) -> Workshop:
  """Get workshop details."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')
  return workshop


@router.post('/{workshop_id}/traces')
async def upload_traces(workshop_id: str, traces: List[TraceUpload], db: Session = Depends(get_db)) -> List[Trace]:
  """Upload traces to a workshop."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  return db_service.add_traces(workshop_id, traces)


@router.get('/{workshop_id}/traces')
async def get_traces(workshop_id: str, user_id: str, db: Session = Depends(get_db)) -> List[Trace]:
  """Get traces for a workshop in user-specific order.

  Args:
      workshop_id: The workshop ID
      user_id: The user ID (REQUIRED for personalized trace ordering)
      db: Database session

  Returns:
      List of traces in user-specific order

  Raises:
      HTTPException: If workshop not found or user_id not provided
  """
  if not user_id:
    raise HTTPException(status_code=400, detail='user_id is required for fetching traces')

  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # If we're in discovery phase and have active discovery traces, return only those
  if workshop.current_phase == 'discovery' and workshop.active_discovery_trace_ids:
    return db_service.get_active_discovery_traces(workshop_id, user_id)
  # If we're in annotation phase and have active annotation traces, return only those
  elif workshop.current_phase == 'annotation' and workshop.active_annotation_trace_ids:
    return db_service.get_active_annotation_traces(workshop_id, user_id)
  else:
    # Otherwise return all traces (for facilitators managing the workshop)
    # For facilitators viewing all traces, we don't need user-specific ordering
    return db_service.get_traces(workshop_id)


@router.get('/{workshop_id}/all-traces')
async def get_all_traces(workshop_id: str, db: Session = Depends(get_db)) -> List[Trace]:
  """Get ALL traces for a workshop, unfiltered by phase."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Always return all traces, regardless of phase
  return db_service.get_traces(workshop_id)


@router.get('/{workshop_id}/original-traces')
async def get_original_traces(workshop_id: str, db: Session = Depends(get_db)) -> List[Trace]:
  """Get only the original intake traces for a workshop (no duplicates).

  This endpoint is used for judge tuning where we only want to evaluate
  the original traces, not multiple instances from different annotators.
  """
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Get only the original traces from the database
  return db_service.get_traces(workshop_id)


@router.post('/{workshop_id}/findings')
async def submit_finding(workshop_id: str, finding: DiscoveryFindingCreate, db: Session = Depends(get_db)) -> DiscoveryFinding:
  """Submit a discovery finding."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  return db_service.add_finding(workshop_id, finding)


@router.get('/{workshop_id}/findings')
async def get_findings(workshop_id: str, user_id: Optional[str] = None, db: Session = Depends(get_db)) -> List[DiscoveryFinding]:
  """Get discovery findings for a workshop, optionally filtered by user."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  return db_service.get_findings(workshop_id, user_id)


@router.get('/{workshop_id}/findings-with-users')
async def get_findings_with_user_details(workshop_id: str, user_id: Optional[str] = None, db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
  """Get discovery findings with user details for facilitator view."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  return db_service.get_findings_with_user_details(workshop_id, user_id)


@router.post('/{workshop_id}/rubric')
async def create_rubric(workshop_id: str, rubric_data: RubricCreate, db: Session = Depends(get_db)) -> Rubric:
  """Create or update rubric for a workshop."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  return db_service.create_rubric(workshop_id, rubric_data)


@router.put('/{workshop_id}/rubric')
async def update_rubric(workshop_id: str, rubric_data: RubricCreate, db: Session = Depends(get_db)) -> Rubric:
  """Update rubric for a workshop."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  return db_service.create_rubric(workshop_id, rubric_data)


@router.get('/{workshop_id}/rubric')
async def get_rubric(workshop_id: str, db: Session = Depends(get_db)) -> Rubric:
  """Get rubric for a workshop."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  rubric = db_service.get_rubric(workshop_id)
  if not rubric:
    raise HTTPException(status_code=404, detail='Rubric not found')

  return rubric


@router.put('/{workshop_id}/rubric/questions/{question_id}')
async def update_rubric_question(workshop_id: str, question_id: str, question_data: dict, db: Session = Depends(get_db)) -> Rubric:
  """Update a specific question in the rubric."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  title = question_data.get('title')
  description = question_data.get('description')

  if not title or not description:
    raise HTTPException(status_code=400, detail='Title and description are required')

  rubric = db_service.update_rubric_question(workshop_id, question_id, title, description)
  if not rubric:
    raise HTTPException(status_code=404, detail='Question not found or rubric not found')

  return rubric


@router.delete('/{workshop_id}/rubric/questions/{question_id}')
async def delete_rubric_question(workshop_id: str, question_id: str, db: Session = Depends(get_db)):
  """Delete a specific question from the rubric."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  rubric = db_service.delete_rubric_question(workshop_id, question_id)

  if rubric is None:
    # Question was deleted and no questions remain
    return {'message': 'Question deleted. No questions remain in rubric.'}

  return rubric


@router.post('/{workshop_id}/annotations')
async def submit_annotation(workshop_id: str, annotation: AnnotationCreate, db: Session = Depends(get_db)) -> Annotation:
  """Submit an annotation for a trace."""
  logger.info(f"📝 Received annotation submission: trace_id={annotation.trace_id}, user_id={annotation.user_id}, rating={annotation.rating}, ratings={annotation.ratings}")
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  result = db_service.add_annotation(workshop_id, annotation)
  logger.info(f"✅ Annotation saved to DB: id={result.id}, ratings={result.ratings}")
  return result


@router.get('/{workshop_id}/annotations')
async def get_annotations(workshop_id: str, user_id: Optional[str] = None, db: Session = Depends(get_db)) -> List[Annotation]:
  """Get annotations for a workshop, optionally filtered by user."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  annotations = db_service.get_annotations(workshop_id, user_id)
  logger.info(f"📖 Retrieved {len(annotations)} annotations for workshop={workshop_id}, user={user_id}")
  if annotations:
    logger.info(f"📖 Sample annotation: id={annotations[0].id}, ratings={annotations[0].ratings}, legacy_rating={annotations[0].rating}")
  return annotations


@router.get('/{workshop_id}/annotations-with-users')
async def get_annotations_with_user_details(workshop_id: str, user_id: Optional[str] = None, db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
  """Get annotations with user details for facilitator view."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  return db_service.get_annotations_with_user_details(workshop_id, user_id)


@router.get('/{workshop_id}/irr')
async def get_irr(workshop_id: str, db: Session = Depends(get_db)) -> IRRResult:
  """Calculate Inter-Rater Reliability for a workshop."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  annotations = db_service.get_annotations(workshop_id)
  return calculate_irr_for_workshop(workshop_id, annotations, db)


@router.delete('/{workshop_id}/findings')
async def clear_findings(workshop_id: str, db: Session = Depends(get_db)):
  """Clear all findings for a workshop (for testing)."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  db_service.clear_findings(workshop_id)
  return {'message': 'Findings cleared successfully'}


@router.delete('/{workshop_id}/annotations')
async def clear_annotations(workshop_id: str, db: Session = Depends(get_db)):
  """Clear all annotations for a workshop (for testing)."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  db_service.clear_annotations(workshop_id)
  return {'message': 'Annotations cleared successfully'}


@router.delete('/{workshop_id}/rubric')
async def clear_rubric(workshop_id: str, db: Session = Depends(get_db)):
  """Clear the rubric for a workshop (for testing)."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  db_service.clear_rubric(workshop_id)
  return {'message': 'Rubric cleared successfully'}


@router.post('/{workshop_id}/begin-discovery')
async def begin_discovery_phase(workshop_id: str, trace_limit: Optional[int] = None, db: Session = Depends(get_db)):
  """Begin the discovery phase and distribute traces to participants.

  Args:
      workshop_id: The workshop ID
      trace_limit: Optional limit on number of traces to use (default: all)
      db: Database session
  """

  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Update workshop phase to discovery and mark discovery as started
  db_service.update_workshop_phase(workshop_id, WorkshopPhase.DISCOVERY)
  db_service.update_phase_started(workshop_id, discovery_started=True)

  # Get all traces
  traces = db_service.get_traces(workshop_id)
  total_traces = len(traces)

  # Validate that traces are available before starting discovery
  if total_traces == 0:
    raise HTTPException(
      status_code=400,
      detail='Cannot start discovery: No traces available. Please complete MLflow ingestion in the Intake phase first.',
    )

  print(f'🔍 DEBUG begin_discovery: workshop_id={workshop_id}, trace_limit={trace_limit}, total_traces={total_traces}')
  print(f'🔍 DEBUG trace_ids: {[t.id for t in traces]}')

  # Apply trace limit - take first N traces in chronological order (no randomization)
  if trace_limit and trace_limit > 0 and trace_limit < total_traces:
    print(f'🎯 DEBUG: Taking first {trace_limit} traces from {total_traces} (in chronological order)')
    # Take the first N traces in chronological order
    selected_traces = traces[:min(trace_limit, total_traces)]
    trace_ids_to_use = [trace.id for trace in selected_traces]
    traces_used = len(selected_traces)
    print(f'🎯 DEBUG: Selected traces: {trace_ids_to_use}')
  else:
    print(f'🎯 DEBUG: Using all traces (limit={trace_limit}, total={total_traces})')
    # Use all traces
    trace_ids_to_use = [trace.id for trace in traces]
    traces_used = total_traces

  # Store the active discovery trace IDs in the workshop
  db_service.update_active_discovery_traces(workshop_id, trace_ids_to_use)

  return {
    'message': f'Discovery phase started with {traces_used} traces (in chronological order from {total_traces} total)',
    'phase': 'discovery',
    'total_traces': total_traces,
    'traces_used': traces_used,
    'trace_limit': trace_limit,
  }


@router.post('/{workshop_id}/add-traces')
async def add_traces(workshop_id: str, request: dict, db: Session = Depends(get_db)):
  """Add additional traces to the current active phase (discovery or annotation)."""

  additional_count = request.get('additional_count', 0)
  if not additional_count or additional_count <= 0:
    raise HTTPException(status_code=400, detail='additional_count must be a positive integer')

  # Get explicit phase parameter from request (fallback to current_phase for backwards compatibility)
  target_phase = request.get('phase')

  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Use explicit phase if provided, otherwise fall back to current workshop phase
  if target_phase:
    phase_name = target_phase
  else:
    phase_name = workshop.current_phase

  if phase_name == 'discovery':
    # Add to discovery phase
    active_trace_ids = list(workshop.active_discovery_trace_ids or [])
    update_function = db_service.update_active_discovery_traces
  elif phase_name == 'annotation':
    # Add to annotation phase
    active_trace_ids = list(workshop.active_annotation_trace_ids or [])
    update_function = db_service.update_active_annotation_traces
  else:
    # Invalid phase
    raise HTTPException(status_code=400, detail=f'Cannot add traces to phase: {phase_name}. Must be "discovery" or "annotation".')

  # Get all traces and find available ones
  all_traces = db_service.get_traces(workshop_id)
  active_trace_ids_set = set(active_trace_ids)  # Use a set for fast lookup
  available_traces = [trace for trace in all_traces if trace.id not in active_trace_ids_set]

  if not available_traces:
    raise HTTPException(status_code=400, detail='No additional traces available to add')

  # Sample additional traces
  traces_to_add = min(additional_count, len(available_traces))

  if traces_to_add == 0:
    return {
      'message': 'No traces were added - all available traces are already active',
      'traces_added': 0,
      'total_active_traces': len(active_trace_ids),
      'available_traces_remaining': 0,
      'phase': phase_name,
    }

  # Take the first N available traces in order (no randomization)
  # This ensures participants continue from where they left off
  additional_traces = available_traces[:traces_to_add]
  additional_trace_ids = [trace.id for trace in additional_traces]

  # Update the active traces with the additional ones (preserving order)
  new_active_trace_ids = active_trace_ids + additional_trace_ids
  update_function(workshop_id, new_active_trace_ids)

  # Build appropriate message
  if traces_to_add < additional_count:
    message = f'Added {traces_to_add} traces to {phase_name} phase (only {traces_to_add} were available, requested {additional_count})'
  else:
    message = f'Added {traces_to_add} additional traces to {phase_name} phase'

  return {
    'message': message,
    'traces_added': traces_to_add,
    'total_active_traces': len(new_active_trace_ids),
    'available_traces_remaining': len(available_traces) - traces_to_add,
    'phase': phase_name,
  }


# Keep the old endpoints for backward compatibility
@router.post('/{workshop_id}/add-discovery-traces')
async def add_discovery_traces(workshop_id: str, request: dict, db: Session = Depends(get_db)):
  """Add additional traces to the active discovery phase (legacy endpoint)."""
  # Redirect to the unified endpoint
  return await add_traces(workshop_id, request, db)


@router.post('/{workshop_id}/add-annotation-traces')
async def add_annotation_traces(workshop_id: str, request: dict, db: Session = Depends(get_db)):
  """Add additional traces to the annotation phase (legacy endpoint)."""
  # Redirect to the unified endpoint
  return await add_traces(workshop_id, request, db)


@router.post('/{workshop_id}/reorder-annotation-traces')
async def reorder_annotation_traces(workshop_id: str, db: Session = Depends(get_db)):
  """Reorder annotation traces so completed ones come first, then in-progress ones."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')
  
  if not workshop.active_annotation_trace_ids:
    return {'message': 'No active annotation traces to reorder', 'reordered_count': 0}
  
  # Get all annotations for this workshop
  annotations = db_service.get_annotations(workshop_id)
  
  # Count annotations per trace
  from collections import defaultdict
  trace_annotation_counts = defaultdict(int)
  trace_reviewer_counts = defaultdict(set)
  
  for annotation in annotations:
    trace_annotation_counts[annotation.trace_id] += 1
    trace_reviewer_counts[annotation.trace_id].add(annotation.user_id)
  
  # Sort traces by completion status (more reviews first)
  trace_ids = list(workshop.active_annotation_trace_ids)
  sorted_trace_ids = sorted(
    trace_ids,
    key=lambda tid: (
      -len(trace_reviewer_counts[tid]),  # More reviewers first
      -trace_annotation_counts[tid]      # More annotations first
    )
  )
  
  # Update the workshop with the reordered traces
  db_service.update_active_annotation_traces(workshop_id, sorted_trace_ids)
  
  return {
    'message': f'Reordered {len(sorted_trace_ids)} annotation traces by completion status',
    'reordered_count': len(sorted_trace_ids),
    'order': sorted_trace_ids
  }


@router.post('/{workshop_id}/begin-annotation')
async def begin_annotation_phase(workshop_id: str, request: dict = {}, db: Session = Depends(get_db)):
  """Begin the annotation phase with a subset of traces."""
  import random

  # Get the optional trace limit from request (default to 10)
  trace_limit = request.get('trace_limit', 10)

  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Check if rubric exists before starting annotation
  rubric = db_service.get_rubric(workshop_id)
  if not rubric:
    raise HTTPException(
      status_code=400,
      detail='Cannot start annotation phase without a rubric. Please create a rubric first.',
    )

  # Get all traces and select a subset for annotation
  traces = db_service.get_traces(workshop_id)
  if not traces:
    raise HTTPException(status_code=400, detail='No traces available for annotation')

  total_traces = len(traces)

  # Determine how many traces to use
  if trace_limit == -1 or trace_limit >= total_traces:
    # Use all traces
    trace_ids_to_use = [trace.id for trace in traces]
    traces_used = total_traces
  else:
    # Sample a subset of traces
    traces_used = min(trace_limit, total_traces)
    sampled_traces = random.sample(traces, traces_used)
    trace_ids_to_use = [trace.id for trace in sampled_traces]

  # Store the active annotation trace IDs in the workshop
  db_service.update_active_annotation_traces(workshop_id, trace_ids_to_use)

  # Update workshop phase to annotation and mark annotation as started
  db_service.update_workshop_phase(workshop_id, WorkshopPhase.ANNOTATION)
  db_service.update_phase_started(workshop_id, annotation_started=True)

  return {
    'message': f'Annotation phase started with {traces_used} traces (randomly sampled from {total_traces})',
    'phase': 'annotation',
    'total_traces': total_traces,
    'traces_used': traces_used,
    'trace_limit': trace_limit,
  }


@router.post('/{workshop_id}/advance-to-discovery')
async def advance_to_discovery(workshop_id: str, db: Session = Depends(get_db)):
  """Advance workshop from INTAKE to DISCOVERY phase (facilitator only)."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Validation: Check prerequisites
  if workshop.current_phase != WorkshopPhase.INTAKE:
    raise HTTPException(status_code=400, detail=f'Cannot advance to discovery from {workshop.current_phase} phase')

  # Check if traces exist
  traces = db_service.get_traces(workshop_id)
  if len(traces) == 0:
    raise HTTPException(status_code=400, detail='Cannot start discovery phase: No traces uploaded to workshop')

  # Update workshop phase
  db_service.update_workshop_phase(workshop_id, WorkshopPhase.DISCOVERY)

  return {
    'message': 'Workshop advanced to discovery phase',
    'phase': 'discovery',
    'workshop_id': workshop_id,
    'traces_available': len(traces),
  }


@router.post('/{workshop_id}/advance-to-rubric')
async def advance_to_rubric(workshop_id: str, db: Session = Depends(get_db)):
  """Advance workshop from DISCOVERY to RUBRIC phase (facilitator only)."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Validation: Check prerequisites
  if workshop.current_phase != WorkshopPhase.DISCOVERY:
    raise HTTPException(status_code=400, detail=f'Cannot advance to rubric from {workshop.current_phase} phase')

  # Check if any findings exist (facilitator decides if sufficient)
  findings = db_service.get_findings(workshop_id)
  if len(findings) == 0:
    raise HTTPException(status_code=400, detail='Cannot advance to rubric phase: No discovery findings submitted yet')

  # Update workshop phase
  db_service.update_workshop_phase(workshop_id, WorkshopPhase.RUBRIC)

  return {
    'message': 'Workshop advanced to rubric phase',
    'phase': 'rubric',
    'workshop_id': workshop_id,
    'findings_collected': len(findings),
  }


@router.post('/{workshop_id}/advance-to-annotation')
async def advance_to_annotation(workshop_id: str, db: Session = Depends(get_db)):
  """Advance workshop from RUBRIC to ANNOTATION phase (facilitator only)."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Validation: Check prerequisites
  if workshop.current_phase != WorkshopPhase.RUBRIC:
    raise HTTPException(status_code=400, detail=f'Cannot advance to annotation from {workshop.current_phase} phase')

  # Check if rubric exists
  rubric = db_service.get_rubric(workshop_id)
  if not rubric:
    raise HTTPException(status_code=400, detail='Cannot start annotation phase: Rubric must be created first')

  # Update workshop phase
  db_service.update_workshop_phase(workshop_id, WorkshopPhase.ANNOTATION)

  return {
    'message': 'Workshop advanced to annotation phase',
    'phase': 'annotation',
    'workshop_id': workshop_id,
    'rubric_question': rubric.question,
  }


@router.post('/{workshop_id}/advance-to-results')
async def advance_to_results(workshop_id: str, db: Session = Depends(get_db)):
  """Advance workshop from ANNOTATION to RESULTS phase (facilitator only)."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Validation: Check prerequisites
  if workshop.current_phase != WorkshopPhase.ANNOTATION:
    raise HTTPException(status_code=400, detail=f'Cannot advance to results from {workshop.current_phase} phase')

  # Check if annotations exist
  annotations = db_service.get_annotations(workshop_id)
  if len(annotations) == 0:
    raise HTTPException(status_code=400, detail='Cannot advance to results phase: No annotations submitted yet')

  # Update workshop phase
  db_service.update_workshop_phase(workshop_id, WorkshopPhase.RESULTS)

  return {
    'message': 'Workshop advanced to results phase',
    'phase': 'results',
    'workshop_id': workshop_id,
    'annotations_collected': len(annotations),
  }


# Keep the generic endpoint for backward compatibility but add validation
@router.post('/{workshop_id}/advance-phase')
async def advance_workshop_phase(workshop_id: str, target_phase: WorkshopPhase, db: Session = Depends(get_db)):
  """Generic phase advancement - use specific endpoints instead (facilitator only)."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Route to specific validation endpoint
  if target_phase == WorkshopPhase.DISCOVERY:
    return await advance_to_discovery(workshop_id, db)
  elif target_phase == WorkshopPhase.RUBRIC:
    return await advance_to_rubric(workshop_id, db)
  elif target_phase == WorkshopPhase.ANNOTATION:
    return await advance_to_annotation(workshop_id, db)
  elif target_phase == WorkshopPhase.RESULTS:
    return await advance_to_results(workshop_id, db)
  elif target_phase == WorkshopPhase.JUDGE_TUNING:
    return await advance_to_judge_tuning(workshop_id, db)
  else:
    # Allow direct setting for INTAKE (reset functionality)
    db_service.update_workshop_phase(workshop_id, target_phase)
    return {
      'message': f'Workshop set to {target_phase} phase',
      'phase': target_phase,
      'workshop_id': workshop_id,
    }


@router.get('/{workshop_id}/participants')
async def get_workshop_participants(workshop_id: str, db: Session = Depends(get_db)):
  """Get all participants for a workshop."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  participants = db_service.get_workshop_participants(workshop_id)
  return participants


@router.post('/{workshop_id}/generate-discovery-data')
async def generate_discovery_test_data(workshop_id: str, db: Session = Depends(get_db)):
  """Generate realistic discovery findings for testing."""
  import uuid

  # Temporarily allow in all environments for testing
  # if os.getenv("ENVIRONMENT") != "development":
  #     raise HTTPException(status_code=404, detail="Not found")

  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  try:
    from server.database import DiscoveryFindingDB, TraceDB

    # Get all traces for this workshop
    traces = db.query(TraceDB).filter(TraceDB.workshop_id == workshop_id).all()
    if not traces:
      raise HTTPException(status_code=400, detail='No traces found in workshop')

    # Clear existing findings first
    db.query(DiscoveryFindingDB).filter(DiscoveryFindingDB.workshop_id == workshop_id).delete()

    # Create demo users (SMEs and participants)
    demo_users = [
      {'user_id': 'expert_1', 'name': 'Expert 1'},
      {'user_id': 'expert_2', 'name': 'Expert 2'},
      {'user_id': 'expert_3', 'name': 'Expert 3'},
      {'user_id': 'participant_1', 'name': 'Participant 1'},
      {'user_id': 'participant_2', 'name': 'Participant 2'},
    ]

    findings_created = 0
    for user in demo_users:
      for trace in traces:
        # Generate realistic findings based on trace content
        finding_text = f'Quality Assessment: This response demonstrates {"good" if "helpful" in trace.output.lower() else "poor"} customer service quality.\n\nImprovement Analysis: {"The response is clear and helpful" if "helpful" in trace.output.lower() else "The response could be more specific and actionable"}.'  # noqa: E501

        finding = DiscoveryFindingDB(
          id=str(uuid.uuid4()),
          workshop_id=workshop_id,
          trace_id=trace.id,
          user_id=user['user_id'],
          insight=finding_text,
          created_at=workshop.created_at,
        )
        db.add(finding)
        findings_created += 1

    db.commit()

    return {
      'message': f'Generated {findings_created} realistic discovery findings',
      'findings_created': findings_created,
      'users': len(demo_users),
      'traces_analyzed': len(traces),
    }

  except Exception as e:
    db.rollback()
    raise HTTPException(status_code=500, detail=f'Failed to generate discovery data: {str(e)}')


@router.post('/{workshop_id}/generate-rubric-data')
async def generate_rubric_test_data(workshop_id: str, db: Session = Depends(get_db)):
  """Generate realistic rubric for testing."""
  import os
  import uuid

  # Only allow in development environment
  if os.getenv('ENVIRONMENT') != 'development':
    raise HTTPException(status_code=404, detail='Not found')

  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  try:
    # Clear existing rubric first
    from server.database import RubricDB

    db.query(RubricDB).filter(RubricDB.workshop_id == workshop_id).delete()

    # Create a realistic rubric question
    rubric_question = "Response Quality: How well does this response address the customer's concern with appropriate tone and actionable information?"
    rubric = RubricDB(
      id=str(uuid.uuid4()),
      workshop_id=workshop_id,
      question=rubric_question,
      created_by='test_facilitator',
      created_at=workshop.created_at,
    )
    db.add(rubric)
    db.commit()

    return {
      'message': 'Generated realistic rubric for testing',
      'rubric_question': rubric_question,
      'created_by': 'test_facilitator',
    }

  except Exception as e:
    db.rollback()
    raise HTTPException(status_code=500, detail=f'Failed to generate rubric data: {str(e)}')


@router.post('/{workshop_id}/generate-annotation-data')
async def generate_annotation_test_data(workshop_id: str, db: Session = Depends(get_db)):
  """Generate realistic annotations for testing."""
  import os
  import random
  import uuid

  # Only allow in development environment
  if os.getenv('ENVIRONMENT') != 'development':
    raise HTTPException(status_code=404, detail='Not found')

  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Check if rubric exists
  rubric = db_service.get_rubric(workshop_id)
  if not rubric:
    raise HTTPException(
      status_code=400,
      detail='Cannot generate annotations without a rubric. Please generate rubric data first.',
    )

  try:
    from server.database import AnnotationDB, TraceDB

    # Get all traces for this workshop
    traces = db.query(TraceDB).filter(TraceDB.workshop_id == workshop_id).all()
    if not traces:
      raise HTTPException(status_code=400, detail='No traces found in workshop')

    # Clear existing annotations first
    db.query(AnnotationDB).filter(AnnotationDB.workshop_id == workshop_id).delete()

    # Create demo annotators (SMEs and participants)
    demo_annotators = [
      {'user_id': 'expert_1', 'name': 'Expert 1'},
      {'user_id': 'expert_2', 'name': 'Expert 2'},
      {'user_id': 'expert_3', 'name': 'Expert 3'},
      {'user_id': 'participant_1', 'name': 'Participant 1'},
      {'user_id': 'participant_2', 'name': 'Participant 2'},
    ]

    # Generate realistic annotations that mostly agree (for positive Krippendorff's Alpha)
    annotations_created = 0
    trace_count = len(traces)

    for idx, trace in enumerate(traces):
      # 80% high agreement, 15% moderate agreement, 5% disagreement
      if idx < int(trace_count * 0.8):  # High agreement traces
        # Pick a consensus rating with more realistic distribution
        # Use full scale to avoid Krippendorff's Alpha issues
        consensus_rating = random.choice([1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5])

        for annotator in demo_annotators:
          if annotator['user_id'].startswith('expert_'):
            # Experts very close to consensus
            rating = consensus_rating + random.choice([0, 0, 0, 0, 1, -1])
          else:
            # Participants slightly more variation but still close
            rating = consensus_rating + random.choice([0, 0, 0, 1, -1])

          rating = max(1, min(5, rating))

          annotation = AnnotationDB(
            id=str(uuid.uuid4()),
            workshop_id=workshop_id,
            trace_id=trace.id,
            user_id=annotator['user_id'],
            rating=rating,
            comment=f'Rating: {rating}/5',
            created_at=workshop.created_at,
          )
          db.add(annotation)
          annotations_created += 1

      elif idx < int(trace_count * 0.95):  # Moderate agreement traces
        # Wider spread but still reasonable
        base_rating = random.choice([2, 3, 3, 3, 4])

        for annotator in demo_annotators:
          rating = base_rating + random.choice([-1, -1, 0, 0, 1, 1])
          rating = max(1, min(5, rating))

          annotation = AnnotationDB(
            id=str(uuid.uuid4()),
            workshop_id=workshop_id,
            trace_id=trace.id,
            user_id=annotator['user_id'],
            rating=rating,
            comment=f'Rating: {rating}/5',
            created_at=workshop.created_at,
          )
          db.add(annotation)
          annotations_created += 1

      else:  # 5% disagreement traces (for discussion examples)
        # Each annotator has their own opinion
        for annotator in demo_annotators:
          rating = random.choice([1, 2, 3, 4, 5])  # Full range for discussion

          annotation = AnnotationDB(
            id=str(uuid.uuid4()),
            workshop_id=workshop_id,
            trace_id=trace.id,
            user_id=annotator['user_id'],
            rating=rating,
            comment=f'Rating: {rating}/5',
            created_at=workshop.created_at,
          )
          db.add(annotation)
          annotations_created += 1

    db.commit()

    return {
      'message': f'Generated {annotations_created} realistic annotations with varied agreement levels',
      'annotations_created': annotations_created,
      'annotators': len(demo_annotators),
      'traces_annotated': len(traces),
    }

  except Exception as e:
    db.rollback()
    raise HTTPException(status_code=500, detail=f'Failed to generate annotation data: {str(e)}')


@router.post('/{workshop_id}/generate-test-data')
async def generate_test_data(workshop_id: str, db: Session = Depends(get_db)):
  """Generate all test data (rubric + annotations) for development."""
  import os

  # Only allow in development environment
  if os.getenv('ENVIRONMENT') != 'development':
    raise HTTPException(status_code=404, detail='Not found')

  try:
    # Generate rubric first
    await generate_rubric_test_data(workshop_id, db)

    # Then generate annotations
    result = await generate_annotation_test_data(workshop_id, db)

    return {
      'message': 'Generated complete test dataset',
      'rubric': 'Response Quality rubric created',
      'annotations': result['message'],
      'annotations_created': result['annotations_created'],
    }

  except Exception as e:
    raise HTTPException(status_code=500, detail=f'Failed to generate test data: {str(e)}')


@router.post('/{workshop_id}/advance-to-judge-tuning')
async def advance_to_judge_tuning(workshop_id: str, db: Session = Depends(get_db)):
  """Advance workshop from ANNOTATION or RESULTS to JUDGE_TUNING phase (facilitator only)."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Validation: Check prerequisites - allow advancement from annotation and results phases
  # Also allow if already in judge_tuning phase (idempotent operation)
  if workshop.current_phase not in [
    WorkshopPhase.ANNOTATION,
    WorkshopPhase.RESULTS,
    WorkshopPhase.JUDGE_TUNING,
  ]:
    raise HTTPException(
      status_code=400,
      detail=f'Cannot advance to judge tuning from {workshop.current_phase} phase. Must be in annotation or results phase.',
    )

  # If already in judge_tuning phase, just return success
  if workshop.current_phase == WorkshopPhase.JUDGE_TUNING:
    return {
      'message': 'Workshop is already in judge tuning phase',
      'phase': 'judge_tuning',
      'workshop_id': workshop_id,
      'already_in_phase': True,
    }

  # Get annotations count for validation
  annotations = db_service.get_annotations(workshop_id)

  # Advance to judge tuning phase
  db_service.update_workshop_phase(workshop_id, WorkshopPhase.JUDGE_TUNING)

  return {
    'message': 'Workshop advanced to judge tuning phase',
    'phase': 'judge_tuning',
    'workshop_id': workshop_id,
    'annotations_available': len(annotations),
  }


@router.post('/{workshop_id}/advance-to-unity-volume')
async def advance_to_unity_volume(workshop_id: str, db: Session = Depends(get_db)):
  """Advance workshop from JUDGE_TUNING to UNITY_VOLUME phase (facilitator only)."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Validation: Check prerequisites - allow advancement from judge_tuning phase
  # Also allow if already in unity_volume phase (idempotent operation)
  if workshop.current_phase not in [WorkshopPhase.JUDGE_TUNING, WorkshopPhase.UNITY_VOLUME]:
    raise HTTPException(
      status_code=400,
      detail=f'Cannot advance to Unity Volume from {workshop.current_phase} phase. Must be in judge tuning phase.',
    )

  # If already in unity_volume phase, just return success
  if workshop.current_phase == WorkshopPhase.UNITY_VOLUME:
    return {
      'message': 'Workshop is already in Unity Volume phase',
      'phase': 'unity_volume',
      'workshop_id': workshop_id,
      'already_in_phase': True,
    }

  # Advance to Unity Volume phase
  db_service.update_workshop_phase(workshop_id, WorkshopPhase.UNITY_VOLUME)

  return {
    'message': 'Workshop advanced to Unity Volume phase',
    'phase': 'unity_volume',
    'workshop_id': workshop_id,
  }


@router.post('/{workshop_id}/upload-to-volume')
async def upload_workshop_to_volume(workshop_id: str, upload_request: dict, db: Session = Depends(get_db)):
  """Upload workshop SQLite database to Unity Catalog volume using provided credentials."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  try:
    # Parse request parameters
    volume_path = upload_request.get('volume_path', '')
    file_name = upload_request.get('file_name', f'workshop_{workshop_id}.db')
    databricks_host = upload_request.get('databricks_host', '')
    databricks_token = upload_request.get('databricks_token', '')

    if not all([volume_path, databricks_host, databricks_token]):
      raise HTTPException(status_code=400, detail='Missing required fields: volume_path, databricks_host, and databricks_token')

    # Parse volume path components
    parts = volume_path.strip().split('.')
    if len(parts) != 3:
      raise HTTPException(status_code=400, detail='Volume path must be in format: catalog.schema.volume_name')

    catalog, schema, volume = parts

    # Get the SQLite database file path
    db_file_path = 'workshop.db'  # This should be the current workshop database

    if not os.path.exists(db_file_path):
      raise HTTPException(status_code=404, detail=f'SQLite database file not found: {db_file_path}')

    # Upload to Unity Catalog volume using REST API
    import requests

    # Read file into bytes
    with open(db_file_path, 'rb') as f:
      file_bytes = f.read()

    # Construct volume file path
    volume_file_path = f'/Volumes/{catalog}/{schema}/{volume}/{file_name}'

    # Upload file using REST API
    upload_url = f'{databricks_host.rstrip("/")}/api/2.0/fs/files{volume_file_path}'

    headers = {'Authorization': f'Bearer {databricks_token}', 'Content-Type': 'application/octet-stream'}

    response = requests.put(upload_url, data=file_bytes, headers=headers, params={'overwrite': 'true'})

    if response.status_code != 204:
      raise Exception(f'Upload failed with status {response.status_code}: {response.text}')

    return {
      'message': 'Workshop database uploaded successfully to Unity Catalog volume',
      'volume_path': volume_path,
      'file_path': volume_file_path,
      'file_name': file_name,
      'file_size': len(file_bytes),
      'catalog': catalog,
      'schema': schema,
      'volume': volume,
    }

  except Exception as e:
    print(f'Error uploading to volume: {str(e)}')
    raise HTTPException(status_code=500, detail=f'Failed to upload to volume: {str(e)}')


@router.get('/{workshop_id}/download-database')
async def download_workshop_database(workshop_id: str, db: Session = Depends(get_db)):
  """Download the workshop SQLite database file."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Get the SQLite database file path
  db_file_path = 'workshop.db'

  if not os.path.exists(db_file_path):
    raise HTTPException(status_code=404, detail=f'SQLite database file not found: {db_file_path}')

  try:
    # Read the database file
    with open(db_file_path, 'rb') as f:
      file_content = f.read()

    # Return the file as a response
    from fastapi.responses import Response

    return Response(
      content=file_content,
      media_type='application/octet-stream',
      headers={'Content-Disposition': f'attachment; filename="workshop_{workshop_id}_{workshop.name.replace(" ", "_")}.db"'},
    )

  except Exception as e:
    print(f'Error downloading database: {str(e)}')
    raise HTTPException(status_code=500, detail=f'Failed to download database: {str(e)}')


# Phase Completion Management Endpoints
@router.post('/{workshop_id}/complete-phase/{phase}')
async def complete_phase(workshop_id: str, phase: str, db: Session = Depends(get_db)):
  """Mark a phase as completed (facilitator only)."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Get current completed phases
  completed = workshop.completed_phases or []

  # Add phase if not already completed
  if phase not in completed:
    completed.append(phase)

    # Update in database
    db_workshop = db.query(WorkshopDB).filter(WorkshopDB.id == workshop_id).first()
    db_workshop.completed_phases = completed
    db.commit()

  return {
    'message': f'Phase {phase} marked as completed',
    'completed_phases': completed,
    'workshop_id': workshop_id,
  }


@router.post('/{workshop_id}/resume-phase/{phase}')
async def resume_phase(workshop_id: str, phase: str, db: Session = Depends(get_db)):
  """Resume a completed phase (facilitator only)."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Get current completed phases
  completed = workshop.completed_phases or []

  # Remove phase from completed list
  if phase in completed:
    completed.remove(phase)

    # Update current phase to the resumed one
    db_workshop = db.query(WorkshopDB).filter(WorkshopDB.id == workshop_id).first()
    db_workshop.completed_phases = completed
    db_workshop.current_phase = phase
    db.commit()

  return {
    'message': f'Phase {phase} resumed',
    'current_phase': phase,
    'completed_phases': completed,
    'workshop_id': workshop_id,
  }


# Judge Tuning Endpoints
@router.post('/{workshop_id}/judge-prompts')
async def create_judge_prompt(workshop_id: str, prompt_data: JudgePromptCreate, db: Session = Depends(get_db)) -> JudgePrompt:
  """Create a new judge prompt."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  try:
    return db_service.create_judge_prompt(workshop_id, prompt_data)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f'Failed to create judge prompt: {str(e)}')


@router.get('/{workshop_id}/judge-prompts')
async def get_judge_prompts(workshop_id: str, db: Session = Depends(get_db)) -> List[JudgePrompt]:
  """Get all judge prompts for a workshop."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  return db_service.get_judge_prompts(workshop_id)


@router.put('/{workshop_id}/judge-prompts/{prompt_id}/metrics')
async def update_judge_prompt_metrics(workshop_id: str, prompt_id: str, metrics_data: dict, db: Session = Depends(get_db)):
  """Update performance metrics for a judge prompt."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Check if prompt exists
  prompt = db_service.get_judge_prompt(workshop_id, prompt_id)
  if not prompt:
    raise HTTPException(status_code=404, detail='Prompt not found')

  try:
    db_service.update_judge_prompt_metrics(prompt_id, metrics_data)
    return {'message': 'Metrics updated successfully', 'prompt_id': prompt_id}
  except Exception as e:
    raise HTTPException(status_code=500, detail=f'Failed to update metrics: {str(e)}')


@router.post('/{workshop_id}/evaluate-judge')
async def evaluate_judge_prompt(
  workshop_id: str, evaluation_request: JudgeEvaluationRequest, db: Session = Depends(get_db)
) -> JudgePerformanceMetrics:
  """Evaluate a judge prompt against human annotations."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  try:
    from server.services.judge_service import JudgeService

    judge_service = JudgeService(db_service)

    return judge_service.evaluate_prompt(workshop_id, evaluation_request)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f'Failed to evaluate judge: {str(e)}')


@router.post('/{workshop_id}/evaluate-judge-direct')
async def evaluate_judge_prompt_direct(
  workshop_id: str, evaluation_request: JudgeEvaluationDirectRequest, db: Session = Depends(get_db)
) -> JudgeEvaluationResult:
  """Evaluate a judge prompt directly without saving it to history."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  try:
    from server.services.judge_service import JudgeService

    judge_service = JudgeService(db_service)

    return judge_service.evaluate_prompt_direct(workshop_id, evaluation_request)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f'Failed to evaluate judge: {str(e)}')


@router.get('/{workshop_id}/judge-evaluations/{prompt_id}')
async def get_judge_evaluations(workshop_id: str, prompt_id: str, db: Session = Depends(get_db)) -> List[JudgeEvaluation]:
  """Get evaluation results for a specific judge prompt."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  return db_service.get_judge_evaluations(workshop_id, prompt_id)


@router.post('/{workshop_id}/judge-evaluations/{prompt_id}')
async def save_judge_evaluations(
  workshop_id: str,
  prompt_id: str,
  evaluations: List[JudgeEvaluation],
  db: Session = Depends(get_db),
):
  """Save evaluation results for a specific judge prompt."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Verify prompt exists
  prompt = db_service.get_judge_prompt(workshop_id, prompt_id)
  if not prompt:
    raise HTTPException(status_code=404, detail='Judge prompt not found')

  # Update prompt_id for all evaluations to ensure they're linked correctly
  for evaluation in evaluations:
    evaluation.prompt_id = prompt_id
    evaluation.workshop_id = workshop_id

  try:
    db_service.store_judge_evaluations(evaluations)
    return {'message': f'Saved {len(evaluations)} evaluations for prompt {prompt_id}'}
  except Exception as e:
    raise HTTPException(status_code=500, detail=f'Failed to save evaluations: {str(e)}')


@router.post('/{workshop_id}/export-judge')
async def export_judge(workshop_id: str, export_config: JudgeExportConfig, db: Session = Depends(get_db)) -> Dict[str, Any]:
  """Export a judge configuration."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  try:
    from server.services.judge_service import JudgeService

    judge_service = JudgeService(db_service)

    return judge_service.export_judge(workshop_id, export_config)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f'Failed to export judge: {str(e)}')


@router.post('/{workshop_id}/mlflow-config')
async def configure_mlflow_intake(workshop_id: str, config: MLflowIntakeConfigCreate, db: Session = Depends(get_db)) -> MLflowIntakeConfig:
  """Configure MLflow intake for a workshop (token stored in memory, not database)."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  try:
    # Store token in memory
    from server.services.token_storage_service import token_storage

    if config.databricks_token:
      token_storage.store_token(workshop_id, config.databricks_token)

    # Create config without token (token will be retrieved from memory during ingestion)
    config_without_token = MLflowIntakeConfig(
      databricks_host=config.databricks_host,
      databricks_token='',  # Don't store token in database
      experiment_id=config.experiment_id,
      max_traces=config.max_traces,
      filter_string=config.filter_string,
    )

    return db_service.create_mlflow_config(workshop_id, config_without_token)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f'Failed to configure MLflow intake: {str(e)}')


@router.get('/{workshop_id}/mlflow-config')
async def get_mlflow_config(workshop_id: str, db: Session = Depends(get_db)) -> Optional[MLflowIntakeConfig]:
  """Get MLflow intake configuration for a workshop."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  return db_service.get_mlflow_config(workshop_id)


@router.get('/{workshop_id}/mlflow-status')
async def get_mlflow_intake_status(workshop_id: str, db: Session = Depends(get_db)) -> MLflowIntakeStatus:
  """Get MLflow intake status for a workshop."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  return db_service.get_mlflow_intake_status(workshop_id)


@router.post('/{workshop_id}/mlflow-test-connection')
async def test_mlflow_connection(workshop_id: str, config: MLflowIntakeConfigCreate, db: Session = Depends(get_db)) -> Dict[str, Any]:
  """Test MLflow connection and return experiment info."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  try:
    from server.services.mlflow_intake_service import MLflowIntakeService

    mlflow_service = MLflowIntakeService(db_service)

    mlflow_config = MLflowIntakeConfig(
      databricks_host=config.databricks_host,
      databricks_token=config.databricks_token,
      experiment_id=config.experiment_id,
      max_traces=config.max_traces,
      filter_string=config.filter_string,
    )

    return mlflow_service.test_connection(mlflow_config)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f'Failed to test MLflow connection: {str(e)}')


@router.post('/{workshop_id}/mlflow-ingest')
async def ingest_mlflow_traces(workshop_id: str, ingest_request: dict, db: Session = Depends(get_db)) -> Dict[str, Any]:
  """Ingest traces from MLflow into the workshop."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Get MLflow configuration (without token)
  config = db_service.get_mlflow_config(workshop_id)
  if not config:
    raise HTTPException(
      status_code=400,
      detail='MLflow configuration not found. Please configure MLflow intake first.',
    )

  # Get token from memory storage
  from server.services.token_storage_service import token_storage

  databricks_token = token_storage.get_token(workshop_id)
  if not databricks_token:
    raise HTTPException(
      status_code=400,
      detail='Databricks token not found in memory. Please reconfigure MLflow intake with your token.',
    )

  # Create config with token for ingestion
  config_with_token = MLflowIntakeConfig(
    databricks_host=config.databricks_host,
    databricks_token=databricks_token,
    experiment_id=config.experiment_id,
    max_traces=config.max_traces,
    filter_string=config.filter_string,
  )

  try:
    from server.services.mlflow_intake_service import MLflowIntakeService

    mlflow_service = MLflowIntakeService(db_service)

    # Ingest traces
    trace_count = mlflow_service.ingest_traces(workshop_id, config_with_token)

    # Update ingestion status
    db_service.update_mlflow_ingestion_status(workshop_id, trace_count)

    return {
      'message': f'Successfully ingested {trace_count} traces from MLflow',
      'trace_count': trace_count,
      'workshop_id': workshop_id,
    }
  except Exception as e:
    # Update ingestion status with error
    db_service.update_mlflow_ingestion_status(workshop_id, 0, str(e))
    raise HTTPException(status_code=500, detail=f'Failed to ingest traces: {str(e)}')


@router.get('/{workshop_id}/mlflow-traces')
async def get_mlflow_traces(workshop_id: str, config: MLflowIntakeConfigCreate, db: Session = Depends(get_db)) -> List[MLflowTraceInfo]:
  """Get available traces from MLflow (without ingesting)."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  try:
    from server.services.mlflow_intake_service import MLflowIntakeService

    mlflow_service = MLflowIntakeService(db_service)

    mlflow_config = MLflowIntakeConfig(
      databricks_host=config.databricks_host,
      databricks_token=config.databricks_token,
      experiment_id=config.experiment_id,
      max_traces=config.max_traces,
      filter_string=config.filter_string,
    )

    return mlflow_service.search_traces(mlflow_config)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f'Failed to get MLflow traces: {str(e)}')


# User Discovery Completion endpoints
@router.post('/{workshop_id}/users/{user_id}/complete-discovery')
async def mark_user_discovery_complete(workshop_id: str, user_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
  """Mark a user as having completed discovery for a workshop."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Check if user exists in workshop
  user = db_service.get_user(user_id)
  if not user or user.workshop_id != workshop_id:
    raise HTTPException(status_code=404, detail='User not found in workshop')

  # Mark user as complete
  db_service.mark_user_discovery_complete(workshop_id, user_id)

  return {
    'message': f'User {user_id} marked as discovery complete',
    'workshop_id': workshop_id,
    'user_id': user_id,
  }


@router.get('/{workshop_id}/discovery-completion-status')
async def get_discovery_completion_status(workshop_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
  """Get discovery completion status for all users in a workshop."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  return db_service.get_discovery_completion_status(workshop_id)


@router.get('/{workshop_id}/users/{user_id}/discovery-complete')
async def is_user_discovery_complete(workshop_id: str, user_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
  """Check if a user has completed discovery for a workshop."""
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')

  # Check if user exists in workshop
  user = db_service.get_user(user_id)
  if not user or user.workshop_id != workshop_id:
    raise HTTPException(status_code=404, detail='User not found in workshop')

  is_complete = db_service.is_user_discovery_complete(workshop_id, user_id)

  return {
    'workshop_id': workshop_id,
    'user_id': user_id,
    'user_name': user.name,
    'user_email': user.email,
    'discovery_complete': is_complete,
  }


@router.post('/{workshop_id}/migrate-annotations')
async def migrate_annotations_to_multi_metric(workshop_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
  """
  Migrate old annotations (with single 'rating' field) to new format (with 'ratings' dict).
  This populates the 'ratings' dictionary by copying the legacy 'rating' value to all rubric questions.
  """
  db_service = DatabaseService(db)
  workshop = db_service.get_workshop(workshop_id)
  if not workshop:
    raise HTTPException(status_code=404, detail='Workshop not found')
  
  # Get rubric to know the question IDs
  rubric = db_service.get_rubric(workshop_id)
  if not rubric:
    raise HTTPException(status_code=404, detail='Rubric not found for workshop')
  
  # Parse rubric questions to get question IDs
  question_parts = rubric.question.split('\n\n')
  question_ids = [f"{rubric.id}_{index}" for index in range(len(question_parts))]
  
  # Get all annotations for this workshop
  annotations = db_service.get_annotations(workshop_id)
  
  migrated_count = 0
  already_migrated_count = 0
  
  for annotation in annotations:
    # Check if already has ratings dict populated
    if annotation.ratings and len(annotation.ratings) > 0:
      already_migrated_count += 1
      continue
    
    # Migrate: Copy legacy rating to all question IDs
    if annotation.rating is not None:
      new_ratings = {}
      for question_id in question_ids:
        new_ratings[question_id] = annotation.rating
      
      # Update the annotation in the database
      db_service.db.query(db_service.db_models.Annotation).filter(
        db_service.db_models.Annotation.id == annotation.id
      ).update({
        'ratings': new_ratings
      })
      migrated_count += 1
  
  # Commit all changes
  db_service.db.commit()
  
  return {
    'workshop_id': workshop_id,
    'total_annotations': len(annotations),
    'migrated': migrated_count,
    'already_migrated': already_migrated_count,
    'question_ids': question_ids,
    'message': f'Successfully migrated {migrated_count} annotations to multi-metric format'
  }

