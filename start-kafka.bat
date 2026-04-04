@echo off
echo Starting Zookeeper...
start "Zookeeper" cmd /k "C:\Users\sable\OneDrive\Desktop\olaa\kafka_local\bin\windows\zookeeper-server-start.bat C:\Users\sable\OneDrive\Desktop\olaa\kafka_local\config\zookeeper.properties"

echo Waiting 15 seconds for Zookeeper to fully boot up...
ping 127.0.0.1 -n 16 > nul

echo Starting Kafka...
start "Kafka" cmd /k "C:\Users\sable\OneDrive\Desktop\olaa\kafka_local\bin\windows\kafka-server-start.bat C:\Users\sable\OneDrive\Desktop\olaa\kafka_local\config\server.properties"

echo Apache Kafka is now starting in the background windows!
