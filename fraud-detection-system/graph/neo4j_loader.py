from neo4j import GraphDatabase
import logging

logger = logging.getLogger(__name__)

class Neo4jConnection:
    """Singleton implementation of Neo4j Driver Connection Pooling"""
    _instance = None

    def __new__(cls, uri="neo4j://localhost:7687", user="neo4j", pwd="password"):
        if cls._instance is None:
            cls._instance = super(Neo4jConnection, cls).__new__(cls)
            try:
                cls._instance.driver = GraphDatabase.driver(uri, auth=(user, pwd))
                logger.info("Initialized Neo4j driver connection.")
            except Exception as e:
                logger.error(f"Failed to create Neo4j driver: {e}")
                cls._instance.driver = None
        return cls._instance

    def close(self):
        if self.driver is not None:
            self.driver.close()
            logger.info("Closed Neo4j driver connection.")

    def execute_query(self, query, parameters=None, db=None):
        if self.driver is None:
            logger.warning("Driver not initialized! Operating in dry-run mode for development.")
            return []
            
        session = None
        response = None
        try:
            session = self.driver.session(database=db) if db else self.driver.session()
            response = session.run(query, parameters)
            return [record for record in response]
        except Exception as e:
            logger.error(f"Query failed: {e}")
            raise
        finally:
            if session is not None:
                session.close()
