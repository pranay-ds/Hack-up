from neo4j import GraphDatabase

passwords = ['password', 'neo4j', 'admin', '']
working_pwd = None
for pwd in passwords:
    try:
        driver = GraphDatabase.driver('bolt://localhost:7687', auth=('neo4j', pwd))
        driver.verify_connectivity()
        with driver.session() as s:
            count = s.run('MATCH (n) RETURN count(n) AS cnt').single()['cnt']
        print(f'Neo4j UP | password="{pwd}" | node count={count}')
        working_pwd = pwd
        driver.close()
        break
    except Exception as e:
        print(f'password="{pwd}" FAILED: {e}')

if not working_pwd:
    print("Neo4j is OFFLINE or credentials unknown")
