import unittest
from unittest.mock import patch, MagicMock
from ingestion.producer import produce_transaction_event
from streaming.flink_job import run_stream_processor
from kafka.errors import NoBrokersAvailable

class TestKafkaIntegration(unittest.TestCase):
    
    @patch('ingestion.producer.KafkaProducer')
    def test_producer_publishes_to_kafka(self, mock_producer_class):
        # Setup mock producer
        mock_producer_instance = MagicMock()
        mock_producer_class.return_value = mock_producer_instance
        
        # We have to re-initialize to pick up the mock because the module 
        # instantiated it at import time, but we can test the behavior.
        import ingestion.producer
        # Force re-init with mocked class
        ingestion.producer.producer_instance.__init__()
        
        sample_tx = {"transaction_id": "123", "user_id": "u1", "amount": 500}
        
        # Test the produce function
        success = ingestion.producer.produce_transaction_event(sample_tx)
        
        # Verify it was called with the correct topic, key, and payload
        self.assertTrue(success)
        mock_producer_instance.send.assert_called_once_with(
            "transactions_topic", 
            key="u1", 
            value=sample_tx
        )
        print("PASS: Producer successfully calls KafkaProducer.send() when broker is available.")

    @patch('streaming.flink_job.KafkaConsumer')
    @patch('streaming.flink_job.KafkaProducer')
    @patch('streaming.flink_job.evaluate_transaction_pipeline')
    def test_stream_processor_loop(self, mock_evaluate_pipeline, mock_kafka_producer, mock_kafka_consumer):
        # We mock the consumer returning a single message, then raising an exception to break the loop
        mock_message = MagicMock()
        mock_message.value = {"transaction_id": "999", "user_id": "u2", "amount": 60000}
        
        mock_consumer_instance = MagicMock()
        mock_consumer_instance.__iter__.return_value = [mock_message]
        mock_kafka_consumer.return_value = mock_consumer_instance

        mock_evaluate_pipeline.return_value = {
            "transaction_id": "999",
            "decision": "BLOCK",
            "reasons": ["Synthetic high-risk scenario for stream loop test"],
            "risk_scores": {"ensemble_score": 0.99},
        }
        
        mock_producer_instance = MagicMock()
        mock_kafka_producer.return_value = mock_producer_instance
        
        # Call processor
        from streaming.flink_job import run_stream_processor
        run_stream_processor()
        
        # Verify the processor consumed the event and pushed a decision
        mock_producer_instance.send.assert_called_once()
        args, kwargs = mock_producer_instance.send.call_args
        self.assertEqual(args[0], "decisions_topic")
        self.assertEqual(kwargs['value']['decision'], "BLOCK")
        print("PASS: Stream Processor consumes from topic, evaluates ML/rules, and produces to decisions_topic.")

if __name__ == "__main__":
    unittest.main()
