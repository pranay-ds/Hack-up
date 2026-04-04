import json
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import logging
from kafka import KafkaConsumer, KafkaProducer
from decision_engine.decision import evaluate_transaction_pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lazy-import Neo4j so we don't crash if it's offline
try:
    from graph.neo4j_loader import neo4j_instance
    NEO4J_AVAILABLE = True
except Exception:
    NEO4J_AVAILABLE = False

def run_stream_processor():
    broker = os.environ.get("KAFKA_BROKER", "localhost:9092")
    input_topic = os.environ.get("KAFKA_TOPIC_TRANSACTIONS", "transactions_topic")
    output_topic = os.environ.get("KAFKA_TOPIC_DECISIONS", "decisions_topic")

    logger.info(f"Starting Stream Processor. Connecting to {broker}...")

    # Retry connection loop
    consumer = None
    producer = None
    for attempt in range(15):
        try:
            consumer = KafkaConsumer(
                input_topic,
                bootstrap_servers=[broker],
                auto_offset_reset='latest',
                enable_auto_commit=True,
                group_id='fraud-detection-group',
                value_deserializer=lambda x: json.loads(x.decode('utf-8'))
            )
            producer = KafkaProducer(
                bootstrap_servers=[broker],
                value_serializer=lambda v: json.dumps(v).encode('utf-8')
            )
            logger.info(f"Connected to Kafka! Listening on: {input_topic}...")
            break
        except Exception as e:
            logger.warning(f"Kafka not ready (attempt {attempt+1}/15): {e}")
            import time; time.sleep(2)

    if not consumer:
        logger.error("Could not connect to Kafka after 15 attempts. Exiting.")
        return

    for message in consumer:
        transaction = message.value
        tx_id = transaction.get('transaction_id', 'unknown')
        logger.info(f"Processing: {tx_id}")

        try:
            decision_result = evaluate_transaction_pipeline(transaction)

            # --- FLATTEN payload so React UI can directly read risk_score ---
            risk_scores = decision_result.get("risk_scores", {})
            flat_payload = {
                "transaction_id": decision_result.get("transaction_id"),
                "decision":       decision_result.get("decision"),
                "reasons":        decision_result.get("reasons", []),
                # primary XGBoost score
                "risk_score":     risk_scores.get("ensemble_score", 0.0)
            }

            # --- Push to decisions_topic for WebSocket / React ---
            producer.send(output_topic, value=flat_payload)
            logger.info(f"Decision [{flat_payload['decision']}] score={flat_payload['risk_score']:.2f} → {tx_id}")

            # --- Push to Neo4j graph (if online) ---
            if NEO4J_AVAILABLE:
                try:
                    if not neo4j_instance.driver:
                        neo4j_instance.connect()
                    # Enrich with merchant_id if missing
                    tx_for_graph = dict(transaction)
                    if not tx_for_graph.get("merchant_id"):
                        tx_for_graph["merchant_id"] = tx_for_graph.get("merchant_category", "Unknown")
                    neo4j_instance.ingest_transaction(tx_for_graph)
                except Exception as neo_err:
                    logger.warning(f"Neo4j ingest skipped: {neo_err}")

        except Exception as e:
            logger.error(f"Pipeline error for {tx_id}: {e}")

if __name__ == "__main__":
    run_stream_processor()
