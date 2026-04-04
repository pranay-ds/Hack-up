import json
import os
import logging
from kafka import KafkaProducer
from kafka.errors import KafkaError

logger = logging.getLogger(__name__)

class TransactionProducer:
    def __init__(self):
        # We look for a broker environment variable or default to localhost
        broker = os.environ.get("KAFKA_BROKER", "localhost:9092")
        self.topic = os.environ.get("KAFKA_TOPIC_TRANSACTIONS", "transactions_topic")
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=[broker],
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                key_serializer=lambda k: k.encode('utf-8') if k else None,
                retries=3
            )
            logger.info(f"Connected to Kafka at {broker}")
        except Exception as e:
            logger.error(f"Failed to connect to Kafka: {e}")
            self.producer = None

    def send_transaction(self, transaction_data: dict):
        if not self.producer:
            logger.warning("Kafka producer not initialized. Dropping message.")
            return False
            
        try:
            # Use transaction_id as key to ensure ordering per transaction if needed, 
            # or user_id for user-level ordering. Partitioning by user_id is common in fraud.
            key = str(transaction_data.get('user_id', 'unknown'))
            future = self.producer.send(self.topic, key=key, value=transaction_data)
            future.get(timeout=2) # Wait for confirmation for critical paths, or async for max throughput
            logger.debug(f"Produced transaction {transaction_data.get('transaction_id')} to {self.topic}")
            return True
        except KafkaError as e:
            logger.error(f"Failed to produce message: {e}")
            return False

# Singleton instance
producer_instance = TransactionProducer()

def produce_transaction_event(transaction_data: dict):
    return producer_instance.send_transaction(transaction_data)
