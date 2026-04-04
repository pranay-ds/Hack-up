import logging
from neo4j import GraphDatabase

logger = logging.getLogger(__name__)

class Neo4jLoader:
    def __init__(self, uri="bolt://localhost:7687", user="neo4j", password="password"):
        self.uri = uri
        self.user = user
        self.password = password
        self.driver = None

    def connect(self):
        try:
            self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
            self.driver.verify_connectivity()
            logger.info("Connected to Neo4j")
        except Exception as e:
            logger.warning(f"Neo4j not available: {e}")
            self.driver = None

    def close(self):
        if self.driver is not None:
            self.driver.close()

    def ingest_transaction(self, tx_data: dict):
        if not self.driver:
            return

        query = """
        MERGE (u:User {id: $user_id})
        MERGE (t:Transaction {id: $tx_id})
        SET t.amount = $amount, t.timestamp = $timestamp
        MERGE (m:Merchant {id: $merchant_id})
        MERGE (u)-[:MADE]->(t)
        MERGE (t)-[:PAID_TO]->(m)
        """

        parameters = {
            "user_id":     str(tx_data.get("user_id", "unknown")),
            "tx_id":       str(tx_data.get("transaction_id", "unknown")),
            "amount":      float(tx_data.get("amount", 0)),
            "timestamp":   str(tx_data.get("timestamp", "")),
            "merchant_id": str(tx_data.get("merchant_id") or tx_data.get("merchant_category", "Unknown")),
        }

        if tx_data.get("device_id"):
            query += """
            MERGE (d:Device {id: $device_id})
            MERGE (u)-[:USES]->(d)
            MERGE (t)-[:FROM_DEVICE]->(d)
            """
            parameters["device_id"] = str(tx_data.get("device_id"))

        with self.driver.session() as session:
            try:
                session.run(query, parameters)
            except Exception as e:
                logger.error(f"Neo4j ingest error: {e}")

    def get_recent_graph(self, limit=50):
        if not self.driver:
            # --- DEMO FALLBACK: Return beautiful mock data if Neo4j is offline ---
            return {
                "nodes": [
                    {"id": "User_Alpha", "group": 1, "label": "User"},
                    {"id": "User_Beta", "group": 1, "label": "User"},
                    {"id": "TX_999", "group": 2, "label": "Transaction", "val": 1200},
                    {"id": "TX_888", "group": 2, "label": "Transaction", "val": 3500},
                    {"id": "Merchant_Global", "group": 3, "label": "Merchant"},
                    {"id": "Merchant_Local", "group": 3, "label": "Merchant"}
                ],
                "links": [
                    {"source": "User_Alpha", "target": "TX_999"},
                    {"source": "TX_999", "target": "Merchant_Global"},
                    {"source": "User_Beta", "target": "TX_888"},
                    {"source": "TX_888", "target": "Merchant_Local"}
                ]
            }

        # Works even when Merchant nodes exist without a timestamp
        query = """
        MATCH (u:User)-[:MADE]->(t:Transaction)-[:PAID_TO]->(m:Merchant)
        RETURN u.id AS user, t.id AS tx, m.id AS merchant, t.amount AS amount
        LIMIT $limit
        """
        nodes_dict = {}
        links = []
        with self.driver.session() as session:
            try:
                result = session.run(query, {"limit": limit})
                for record in result:
                    u_id = str(record["user"])
                    t_id = str(record["tx"])
                    m_id = str(record["merchant"])
                    amount = record["amount"]

                    nodes_dict[u_id] = {"id": u_id, "group": 1, "label": "User"}
                    nodes_dict[t_id] = {"id": t_id, "group": 2, "label": "Transaction", "val": amount}
                    nodes_dict[m_id] = {"id": m_id, "group": 3, "label": "Merchant"}

                    links.append({"source": u_id, "target": t_id})
                    links.append({"source": t_id, "target": m_id})
            except Exception as e:
                logger.error(f"Neo4j query error: {e}")
                # Fallback to empty if even session fails but driver exists
                return {"nodes": [], "links": []}

        return {"nodes": list(nodes_dict.values()), "links": links}


neo4j_instance = Neo4jLoader()

def load_to_graph(transaction: dict):
    if not neo4j_instance.driver:
        neo4j_instance.connect()
    neo4j_instance.ingest_transaction(transaction)
