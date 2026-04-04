import os

structure = {
    "ingestion": ["__init__.py", "producer.py", "schemas.py", "config.py"],
    "streaming": ["__init__.py", "flink_job.py", "feature_engineering.py", "window_aggregations.py", "utils.py"],
    "feature_store": ["__init__.py", "online_store.py", "offline_store.py"],
    "feature_store/feast_repo": ["__init__.py", "feature_views.py", "entities.py", "data_sources.py", "repo_config.yaml"],
    "models": ["__init__.py", "model_registry.py"],
    "models/supervised": ["__init__.py", "train_xgb.py", "train_lgbm.py", "inference.py"],
    "models/anomaly": ["__init__.py", "isolation_forest.py", "autoencoder.py", "inference.py"],
    "models/sequence": ["__init__.py", "lstm_model.py", "inference.py"],
    "models/ensemble": ["__init__.py", "weighted.py", "stacking.py", "calibrator.py"],
    "graph": ["__init__.py", "neo4j_loader.py", "graph_builder.py", "graph_features.py", "gnn_model.py", "graph_inference.py"],
    "rules": ["__init__.py", "rules_engine.py", "rules_config.yaml", "rule_utils.py"],
    "decision_engine": ["__init__.py", "decision.py", "thresholds.py", "risk_aggregator.py", "explainability.py"],
    "api": ["__init__.py", "app.py", "routes.py", "schemas.py", "dependencies.py"],
    "monitoring": ["__init__.py", "metrics.py", "logging.py", "drift_detection.py", "alerts.py"],
    "storage": ["__init__.py", "warehouse_connector.py", "transaction_logger.py", "feature_logs.py"],
    "retraining": ["__init__.py", "data_collector.py", "retrain_pipeline.py", "validation.py", "scheduler.py"],
    "configs": ["kafka.yaml", "model.yaml", "thresholds.yaml", "system.yaml"],
    "deployment": [],
    "deployment/docker": ["Dockerfile.api", "Dockerfile.model", "docker-compose.yml"],
    "deployment/kubernetes": ["api-deployment.yaml", "model-deployment.yaml", "kafka.yaml", "redis.yaml"],
    "notebooks": ["eda.ipynb", "feature_analysis.ipynb"],
    "tests": ["__init__.py", "test_api.py", "test_models.py", "test_pipeline.py"]
}

base_files = ["requirements.txt", "README.md", "main.py"]

def scaffold():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Create structure
    for d, files in structure.items():
        dir_path = os.path.join(base_dir, d)
        os.makedirs(dir_path, exist_ok=True)
        for f in files:
            file_path = os.path.join(dir_path, f)
            with open(file_path, "w") as fp:
                pass
                
    # Create base files
    for f in base_files:
        with open(os.path.join(base_dir, f), "w") as fp:
            pass

if __name__ == "__main__":
    scaffold()
    print("Scaffolding complete!")
