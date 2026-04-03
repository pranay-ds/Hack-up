# GODSEC

## Fraud Detection System Architecture

```text
fraud-detection-system/
│
├── 📁 ingestion/                     # Data ingestion (Kafka producers)
│   ├── producer.py
│   ├── schemas.py
│   └── config.py
│
├── 📁 streaming/                    # Real-time processing (Flink/Spark)
│   ├── flink_job.py
│   ├── feature_engineering.py
│   ├── window_aggregations.py
│   └── utils.py
│
├── 📁 feature_store/                # Feast + Redis integration
│   ├── feast_repo/
│   │   ├── feature_views.py
│   │   ├── entities.py
│   │   ├── data_sources.py
│   │   └── repo_config.yaml
│   ├── online_store.py              # Redis interaction
│   └── offline_store.py             # S3 / local parquet
│
├── 📁 models/                       # ML models (ensemble)
│   ├── supervised/
│   │   ├── train_xgb.py
│   │   ├── train_lgbm.py
│   │   └── inference.py
│   │
│   ├── anomaly/
│   │   ├── isolation_forest.py
│   │   ├── autoencoder.py
│   │   └── inference.py
│   │
│   ├── sequence/
│   │   ├── lstm_model.py
│   │   └── inference.py
│   │
│   ├── ensemble/
│   │   ├── weighted.py
│   │   ├── stacking.py
│   │   └── calibrator.py
│   │
│   └── model_registry.py            # MLflow integration
│
├── 📁 graph/                        # Fraud ring detection (VERY IMPORTANT 🔥)
│   ├── neo4j_loader.py
│   ├── graph_builder.py
│   ├── graph_features.py
│   ├── gnn_model.py
│   └── graph_inference.py
│
├── 📁 rules/                        # Rule engine
│   ├── rules_engine.py
│   ├── rules_config.yaml
│   └── rule_utils.py
│
├── 📁 decision_engine/              # FINAL brain
│   ├── decision.py
│   ├── thresholds.py
│   ├── risk_aggregator.py
│   └── explainability.py            # SHAP / logs
│
├── 📁 api/                          # FastAPI serving layer
│   ├── app.py
│   ├── routes.py
│   ├── schemas.py
│   └── dependencies.py
│
├── 📁 monitoring/                   # Observability
│   ├── metrics.py
│   ├── logging.py
│   ├── drift_detection.py
│   └── alerts.py
│
├── 📁 storage/                      # Data storage
│   ├── warehouse_connector.py
│   ├── transaction_logger.py
│   └── feature_logs.py
│
├── 📁 retraining/                   # Feedback loop 🔁
│   ├── data_collector.py
│   ├── retrain_pipeline.py
│   ├── validation.py
│   └── scheduler.py                 # Airflow / cron
│
├── 📁 configs/
│   ├── kafka.yaml
│   ├── model.yaml
│   ├── thresholds.yaml
│   └── system.yaml
│
├── 📁 deployment/                   # Production infra
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.model
│   │   └── docker-compose.yml
│   │
│   ├── kubernetes/
│   │   ├── api-deployment.yaml
│   │   ├── model-deployment.yaml
│   │   ├── kafka.yaml
│   │   └── redis.yaml
│
├── 📁 notebooks/                    # EDA + experiments
│   ├── eda.ipynb
│   └── feature_analysis.ipynb
│
├── 📁 tests/
│   ├── test_api.py
│   ├── test_models.py
│   └── test_pipeline.py
│
├── requirements.txt
├── README.md
└── main.py
```