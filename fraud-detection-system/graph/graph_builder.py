import logging
from typing import List, Dict
from .neo4j_loader import Neo4jConnection

logger = logging.getLogger(__name__)

class GraphBuilder:
    def __init__(self, conn: Neo4jConnection):
        self.conn = conn

    def setup_constraints(self):
        """Set up uniqueness constraints to drastically speed up MERGE operations."""
        queries = [
            "CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE",
            "CREATE CONSTRAINT device_id IF NOT EXISTS FOR (d:Device) REQUIRE d.id IS UNIQUE",
            "CREATE CONSTRAINT txn_id IF NOT EXISTS FOR (t:Transaction) REQUIRE t.id IS UNIQUE",
            "CREATE CONSTRAINT ip_addr IF NOT EXISTS FOR (i:IP) REQUIRE i.address IS UNIQUE"
        ]
        for q in queries:
             self.conn.execute_query(q)
        logger.info("Graph constraints established.")

    def batch_insert_transactions(self, tx_batch: List[Dict]):
        """
        Micro-batch streaming insertion via UNWIND.
        This provides a 10x-100x efficiency gain over line-by-line inserts.
        """
        # Complex optimized MERGE to ensure O(1) node lookup and O(1) edge creation
        query = '''
        UNWIND $batch AS tx
        
        // 1. Transaction Node
        MERGE (t:Transaction {id: tx.id})
        SET t.amount = tx.amount, t.riskScore = tx.riskScore, t.timestamp = tx.timestamp

        // 2. User Node
        MERGE (u:User {id: tx.userId})
        
        // 3. Device Node
        MERGE (d:Device {id: tx.device})
        
        // 4. IP Node
        MERGE (i:IP {address: tx.ip})

        // Relationships
        MERGE (u)-[:INITIATED]->(t)
        MERGE (t)-[:USED_DEVICE]->(d)
        MERGE (t)-[:FROM_IP]->(i)
        '''
        
        self.conn.execute_query(query, parameters={"batch": tx_batch})
        logger.debug(f"Successfully inserted batch of {len(tx_batch)} transactions into Neo4j graph.")
