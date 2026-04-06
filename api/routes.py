from fastapi import APIRouter, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from .schemas import Transaction, RiskResponse
from ingestion.producer import produce_transaction_event
from decision_engine.decision import evaluate_transaction_pipeline
from graph.neo4j_loader import neo4j_instance
from storage.transaction_logger import log_decision_to_db
import json
import asyncio
from kafka import KafkaConsumer

import logging

logger = logging.getLogger("sentinel.routes")
router = APIRouter()

# Local event bus for UI updates (works without Kafka)
ui_updates_queue = asyncio.Queue()

async def broadcast_to_ui(data: dict):
    """Pushes an event to the local broadcast queue for all connected WebSockets"""
    await ui_updates_queue.put(data)

@router.post("/evaluate", response_model=RiskResponse)
async def evaluate_transaction(transaction: Transaction, background_tasks: BackgroundTasks):
    """
    Ingest a transaction synchronously, scoring it against rules and ML models.
    
    The evaluation pipeline is offloaded to a separate thread to ensure low-latency 
    response time. Standard operational logging, data persistence, and event 
    broadcasting are handled asynchronously via background tasks.
    """
    tx_dict = transaction.dict()
    
    logger.info(f"Received transaction for evaluation: {transaction.transaction_id}")
    
    # Offload CPU-intensive decision logic to a worker thread
    decision_result = await asyncio.to_thread(evaluate_transaction_pipeline, tx_dict, False)
    
    # Execute non-blocking I/O tasks in the background
    background_tasks.add_task(
        log_decision_to_db,
        transaction_id=transaction.transaction_id,
        decision=decision_result["decision"],
        risk_score=decision_result["risk_scores"].get("ensemble_score", 0.0),
        reasons=decision_result["reasons"],
    )
    background_tasks.add_task(produce_transaction_event, tx_dict)
    background_tasks.add_task(broadcast_to_ui, decision_result)
    
    logger.info(f"Evaluation complete for {transaction.transaction_id} | Decision: {decision_result['decision']}")
    
    return RiskResponse(
        transaction_id=transaction.transaction_id,
        decision=decision_result["decision"],
        risk_score=decision_result["risk_scores"]["ensemble_score"],
        reasons=decision_result["reasons"]
    )

@router.get("/graph")
async def get_graph_data():
    """Returns the latest nodes and edges for the Neo4j visualization UI"""
    # Use to_thread to prevent blocking the event loop if Neo4j is offline
    if not neo4j_instance.driver:
        await asyncio.to_thread(neo4j_instance.connect)
    
    data = await asyncio.to_thread(neo4j_instance.get_recent_graph, limit=30)
    return data

@router.websocket("/stream")
async def websocket_stream(websocket: WebSocket):
    """Streams live decisions from local Queue + Kafka directly to the React Dashboard"""
    await websocket.accept()
    print("UI Connected to WebSocket stream!")
    
    # 1. Try to connect to Kafka in a separate thread so we don't block the handshake
    kafka_consumer = None
    try:
        def create_consumer():
            return KafkaConsumer(
                "decisions_topic",
                bootstrap_servers=["localhost:9092"],
                auto_offset_reset='latest',
                enable_auto_commit=True,
                group_id='ui-dashboard-group-demo',
                value_deserializer=lambda x: json.loads(x.decode('utf-8')),
                request_timeout_ms=800,      # Faster timeout for local demo
                metadata_max_age_ms=1000,
                connections_max_idle_ms=1000
            )
        
        # We wrap this in a timeout just in case the thread takes too long to even start/fail
        kafka_consumer = await asyncio.wait_for(asyncio.to_thread(create_consumer), timeout=2.0)
        print("Connected to Kafka for streaming.")
    except Exception as e:
        print(f"Kafka not available ({e}) - falling back to local event bus only.")

    try:
        while True:
            # Check local queue first (immediate results from /evaluate)
            try:
                local_msg = ui_updates_queue.get_nowait()
                await websocket.send_json(local_msg)
            except asyncio.QueueEmpty:
                pass

            # Check Kafka second (asynchronous results from streaming jobs)
            if kafka_consumer:
                try:
                    # Poll is also blocking, so we could to_thread this too if needed, 
                    # but timeout_ms=10 is usually fast enough once connected.
                    messages = kafka_consumer.poll(timeout_ms=10)
                    for tp, msgs in messages.items():
                        for msg in msgs:
                            await websocket.send_json(msg.value)
                except Exception as e:
                    print(f"Kafka poll error: {e}")

            await asyncio.sleep(0.1) 
            
    except WebSocketDisconnect:
        print("UI disconnected from WebSocket stream.")
    finally:
        if kafka_consumer:
            try:
                kafka_consumer.close()
            except:
                pass

@router.get("/health")
async def health_check():
    return {"status": "ok"}
