import ForceGraph2D from "react-force-graph-2d";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";

export default function FraudRingGraph({ fraudRings }) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ width: 500, height: 350 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showFraudRings, setShowFraudRings] = useState(true);
  const [riskFilter, setRiskFilter] = useState(0);
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      for (let e of entries) setDims({ width: e.contentRect.width, height: e.contentRect.height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const graphData = useMemo(() => {
    const nodes = [];
    const links = [];
    const nodeSet = new Set();

    fraudRings.forEach(ring => {
      ring.nodes.forEach(uid => {
        if (!nodeSet.has(uid)) {
          nodeSet.add(uid);
          nodes.push({ id: uid, label: uid, type: "user", risk_score: 0.3 + Math.random() * 0.6, connections: 3 + Math.floor(Math.random() * 8), ring: ring.id });
        }
      });
      ring.shared_devices?.forEach(dev => {
        const devId = `DEV:${dev}`;
        if (!nodeSet.has(devId)) { nodeSet.add(devId); nodes.push({ id: devId, label: dev, type: "device", risk_score: 0.2 + Math.random() * 0.4, connections: 2 }); }
        ring.nodes.forEach(uid => links.push({ source: uid, target: devId, type: "shared_device", ring: ring.id }));
      });
      ring.shared_merchants?.forEach(m => {
        const merId = `MER:${m}`;
        if (!nodeSet.has(merId)) { nodeSet.add(merId); nodes.push({ id: merId, label: m, type: "merchant", risk_score: 0.15 + Math.random() * 0.5, connections: 2 }); }
        ring.nodes.forEach(uid => links.push({ source: uid, target: merId, type: "shared_merchant", ring: ring.id }));
      });
      for (let i = 0; i < ring.nodes.length; i++) {
        for (let j = i + 1; j < ring.nodes.length; j++) {
          links.push({ source: ring.nodes[i], target: ring.nodes[j], type: "fraud_ring", ring: ring.id, confidence: ring.confidence });
        }
      }
    });

    let filtered = nodes;
    if (riskFilter > 0) filtered = filtered.filter(n => n.risk_score >= riskFilter);
    if (typeFilter !== "all") filtered = filtered.filter(n => n.type === typeFilter);
    const filteredIds = new Set(filtered.map(n => n.id));
    const filteredLinks = links
      .filter(l => filteredIds.has(l.source) && filteredIds.has(l.target))
      .filter(l => showFraudRings || l.type !== "fraud_ring");

    return { nodes: filtered, links: filteredLinks };
  }, [fraudRings, showFraudRings, riskFilter, typeFilter]);

  const handleNodeHover = useCallback(node => {
    setHoveredNode(node);
  }, []);

  const handleNodeClick = useCallback(node => {
    setSelectedNode(prev => prev?.id === node?.id ? null : node);
  }, []);

  const getNodeColor = useCallback(node => {
    if (selectedNode && node.id === selectedNode.id) return "#e5e5e5";
    if (selectedNode) {
      const isConnected = graphData.links.some(l =>
        (l.source === selectedNode.id && l.target === node.id) ||
        (l.target === selectedNode.id && l.source === node.id)
      );
      if (!isConnected && node.id !== selectedNode.id) return "#666";
    }
    if (node.risk_score > 0.7) return "#ef4444";
    if (node.risk_score > 0.4) return "#fbbf24";
    return "#4ade80";
  }, [selectedNode, graphData]);

  const getLinkColor = useCallback(link => {
    if (selectedNode) {
      if (link.source === selectedNode.id || link.target === selectedNode.id) return "#e5e5e5";
      return "#666";
    }
    if (link.type === "fraud_ring") return "rgba(239,68,68,0.5)";
    return "#888";
  }, [selectedNode]);

  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ padding: "8px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 }}>Fraud Ring Detection</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setShowFraudRings(v => !v)} style={{
            fontSize: 9, padding: "2px 8px", borderRadius: 2,
            background: showFraudRings ? "rgba(239,68,68,0.1)" : "transparent",
            border: `1px solid ${showFraudRings ? "rgba(239,68,68,0.3)" : "#1a1a1a"}`,
            color: showFraudRings ? "#ef4444" : "#666", cursor: "pointer",
          }}>
            Fraud Rings {showFraudRings ? "ON" : "OFF"}
          </button>
          <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#888" }}>
            Min Risk
            <input
              type="range"
              min="0"
              max="0.9"
              step="0.1"
              value={riskFilter}
              onChange={(e) => setRiskFilter(parseFloat(e.target.value))}
              style={{ width: 60 }}
            />
          </label>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{
            fontSize: 9, background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 2, color: "#888", padding: "2px 4px",
          }}>
            <option value="all">All Types</option>
            <option value="user">Users</option>
            <option value="device">Devices</option>
            <option value="merchant">Merchants</option>
          </select>
        </div>
      </div>

      <div ref={containerRef} style={{ width: "100%", height: 320, background: "#111", position: "relative" }}>
        {graphData.nodes.length > 0 ? (
          <ForceGraph2D
            graphData={graphData}
            width={dims.width}
            height={dims.height}
            backgroundColor="#111"
            nodeRelSize={node => node.type === "user" ? 6 : node.type === "device" ? 4 : 3}
            nodeLabel={node => `${node.label} (risk: ${node.risk_score.toFixed(2)})`}
            nodeColor={getNodeColor}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const color = getNodeColor(node);
              const size = node.type === "user" ? 6 : node.type === "device" ? 4 : 3;
              ctx.beginPath();
              ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();
              if (node.risk_score > 0.7) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, size + 3, 0, 2 * Math.PI);
                ctx.strokeStyle = "rgba(239,68,68,0.3)";
                ctx.lineWidth = 1;
                ctx.stroke();
              }
              if (hoveredNode?.id === node.id) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, size + 5, 0, 2 * Math.PI);
                ctx.strokeStyle = "rgba(229,229,229,0.5)";
                ctx.lineWidth = 1;
                ctx.stroke();
              }
              const label = node.label;
              const fontSize = 10 / globalScale;
              ctx.font = `${fontSize}px sans-serif`;
              ctx.fillStyle = "#777";
              ctx.fillText(label, node.x + size + 2, node.y + 3);
            }}
            linkColor={getLinkColor}
            linkWidth={link => link.type === "fraud_ring" ? 2 : 0.5}
            linkDirectionalParticles={link => link.type === "fraud_ring" ? 2 : 0}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor={() => "#ef4444"}
            warmupTicks={30}
            cooldownTicks={60}
            enableNodeDrag={true}
            onNodeHover={handleNodeHover}
            onNodeClick={handleNodeClick}
          />
        ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontSize: 11 }}>No graph data</div>
        )}

        {hoveredNode && (
          <div style={{
            position: "absolute", bottom: 8, left: 8, background: "#1a1a1a", border: "1px solid #444",
            borderRadius: 3, padding: "8px 12px", fontSize: 10, animation: "fadeIn 0.15s",
          }}>
            <div style={{ fontWeight: 600, color: "#e5e5e5", marginBottom: 3 }}>{hoveredNode.label}</div>
            <div style={{ color: "#888" }}>Type: <span style={{ color: "#ccc", textTransform: "capitalize" }}>{hoveredNode.type}</span></div>
            <div style={{ color: "#888" }}>Risk: <span style={{ color: hoveredNode.risk_score > 0.7 ? "#ef4444" : "#4ade80" }}>{hoveredNode.risk_score.toFixed(2)}</span></div>
            <div style={{ color: "#888" }}>Connections: <span style={{ color: "#ccc" }}>{hoveredNode.connections || graphData.links.filter(l => l.source === hoveredNode.id || l.target === hoveredNode.id).length}</span></div>
          </div>
        )}
      </div>

      {fraudRings.length > 0 && (
        <div style={{ borderTop: "1px solid #1a1a1a", padding: "8px 16px" }}>
          {fraudRings.map(ring => (
            <div key={ring.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, fontSize: 10 }}>
              <span style={{ fontFamily: "'SF Mono', monospace", color: "#ccc" }}>{ring.id}</span>
              <span style={{ color: "#666" }}>{ring.nodes?.length || 0} users · ${ring.total_loss?.toLocaleString()} loss</span>
              <span style={{
                fontSize: 8, padding: "1px 5px", borderRadius: 2, textTransform: "uppercase", letterSpacing: 0.5,
                color: ring.status === "active" ? "#ef4444" : "#fbbf24",
                background: ring.status === "active" ? "rgba(239,68,68,0.06)" : "rgba(234,179,8,0.06)",
                border: `1px solid ${ring.status === "active" ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.15)"}`,
              }}>{ring.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
