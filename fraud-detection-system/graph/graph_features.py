import logging
from .neo4j_loader import Neo4jConnection

logger = logging.getLogger(__name__)

class GraphFeatureExtractor:
    def __init__(self, conn: Neo4jConnection):
        self.conn = conn

    def precompute_wcc(self):
        """
        Uses Neo4j Graph Data Science (GDS) to find Weakly Connected Components.
        Extremely effective at finding isolated synthetic fraud rings.
        """
        query = '''
        CALL gds.wcc.write({
            nodeProjection: ['User', 'Device', 'IP'],
            relationshipProjection: ['INITIATED', 'USED_DEVICE', 'FROM_IP'],
            writeProperty: 'communityId'
        })
        YIELD componentCount, computeMillis
        '''
        res = self.conn.execute_query(query)
        if res:
             logger.info(f"WCC Precomputed. Found {res[0]['componentCount']} communities.")

    def precompute_pagerank(self):
        """
        Uses Neo4j GDS to execute PageRank, identifying highly central bridge devices or IPs.
        """
        query = '''
        CALL gds.pageRank.write({
            nodeProjection: ['User', 'Device', 'IP'],
            relationshipProjection: ['INITIATED', 'USED_DEVICE', 'FROM_IP'],
            maxIterations: 20,
            dampingFactor: 0.85,
            writeProperty: 'pageRank'
        })
        YIELD computeMillis
        '''
        self.conn.execute_query(query)
        logger.info("PageRank Precomputed.")

    def fetch_node_features(self, user_id: str) -> dict:
        """Fetch precomputed graph ML features for real-time inference."""
        query = '''
        MATCH (u:User {id: $userId})
        OPTIONAL MATCH (u)-[:INITIATED]->(t)-[:USED_DEVICE]->(d)
        WITH u, count(DISTINCT d) as uniqueDevices
        RETURN u.communityId AS communityId, 
               u.pageRank AS pageRank, 
               uniqueDevices
        '''
        result = self.conn.execute_query(query, {"userId": user_id})
        if result:
            data = result[0].data()
            return data
            
        return {"communityId": 0, "pageRank": 0.0, "uniqueDevices": 0}
