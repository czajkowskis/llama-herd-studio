import uuid
from collections import defaultdict
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent import Agent
from app.models.run import Run
from app.models.workflow import Workflow
from app.services.event_log import append_run_event


def _get_node_label(node: dict[str, Any]) -> str:
    data = node.get("data", {})
    if isinstance(data, dict):
        label = data.get("label")
        if isinstance(label, str) and label:
            return label

    node_id = node.get("id")
    if isinstance(node_id, str):
        return node_id

    return "Unknown Node"


def _build_graph_indexes(
    graph: dict[str, Any],
) -> tuple[dict[str, dict[str, Any]], dict[str, list[dict[str, Any]]]]:
    nodes = graph.get("nodes", [])
    edges = graph.get("edges", [])

    nodes_by_id = {node["id"]: node for node in nodes}
    outgoing_edges_by_source: dict[str, list[dict[str, Any]]] = defaultdict(list)

    for edge in edges:
        outgoing_edges_by_source[edge["source"]].append(edge)

    return nodes_by_id, outgoing_edges_by_source


def _find_input_node(nodes_by_id: dict[str, dict[str, Any]]) -> dict[str, Any]:
    for node in nodes_by_id.values():
        if node.get("type") == "input":
            return node
    raise ValueError("Workflow graph does not contain an input node.")


def _get_next_node(
    *,
    current_node: dict[str, Any],
    nodes_by_id: dict[str, dict[str, Any]],
    outgoing_edges_by_source: dict[str, list[dict[str, Any]]],
) -> dict[str, Any] | None:
    current_node_id = current_node["id"]
    outgoing_edges = outgoing_edges_by_source.get(current_node_id, [])

    if not outgoing_edges:
        return None

    next_node_id = outgoing_edges[0]["target"]
    return nodes_by_id[next_node_id]


async def _execute_agent_node(
    *,
    session: AsyncSession,
    node: dict[str, Any],
    current_payload: dict[str, Any],
) -> tuple[Agent, dict[str, Any]]:
    data = node.get("data", {})

    if not isinstance(data, dict):
        raise ValueError(f"Agent node '{node['id']}' has invalid data")

    agent_id_raw = data.get("agent_id")

    if not isinstance(agent_id_raw, str) or not agent_id_raw:
        raise ValueError(f"Agent node '{node['id']}' must define data.agent_id")

    agent_id = uuid.UUID(agent_id_raw)
    agent = await session.get(Agent, agent_id)

    if agent is None:
        raise ValueError(f"Agent '{agent_id}' not found")

    output = {
        "message": f"{agent.name} processed the workflow input.",
        "agent_id": str(agent.id),
        "agent_name": agent.name,
        "model_provider": agent.model_provider,
        "model_name": agent.model_name,
        "input": current_payload,
    }

    return agent, output


async def execute_workflow_graph(
    *,
    session: AsyncSession,
    run: Run,
    workflow: Workflow,
    input_data: dict[str, Any],
    starting_sequence: int,
) -> tuple[dict[str, Any], int]:
    nodes_by_id, outgoing_edges_by_source = _build_graph_indexes(workflow.graph)
    current_node = _find_input_node(nodes_by_id)
    current_payload = input_data
    sequence = starting_sequence
    visited_node_ids: set[str] = set()

    while current_node is not None:
        node_id = current_node["id"]
        node_type = current_node.get("type")
        node_label = _get_node_label(current_node)

        if node_id in visited_node_ids:
            raise ValueError(f"Cycle detected at node `{node_id}`.")

        visited_node_ids.add(node_id)

        await append_run_event(
            session=session,
            run=run,
            sequence=sequence,
            event_type="node.started",
            node_id=node_id,
            payload={
                "node_id": node_id,
                "node_type": node_type,
                "node_label": node_label,
                "input": current_payload,
            },
        )
        sequence += 1

        if node_type == "agent":
            agent, current_payload = await _execute_agent_node(
                session=session,
                node=current_node,
                current_payload=current_payload,
            )

            await append_run_event(
                session=session,
                run=run,
                sequence=sequence,
                event_type="agent.completed",
                node_id=node_id,
                agent_id=agent.id,
                payload={
                    "agent_id": str(agent.id),
                    "agent_name": agent.name,
                    "output": current_payload,
                },
            )
            sequence += 1

        elif node_type == "input":
            current_payload = input_data

        elif node_type == "output":
            await append_run_event(
                session=session,
                run=run,
                sequence=sequence,
                event_type="node.completed",
                node_id=node_id,
                payload={
                    "node_id": node_id,
                    "node_type": node_type,
                    "node_label": node_label,
                    "output": current_payload,
                },
            )
            sequence += 1
            return current_payload, sequence

        else:
            raise ValueError(f"Unsupported node type `{node_type}`.")

        await append_run_event(
            session=session,
            run=run,
            sequence=sequence,
            event_type="node.completed",
            node_id=node_id,
            payload={
                "node_id": node_id,
                "node_type": node_type,
                "node_label": node_label,
                "output": current_payload,
            },
        )
        sequence += 1

        current_node = _get_next_node(
            current_node=current_node,
            nodes_by_id=nodes_by_id,
            outgoing_edges_by_source=outgoing_edges_by_source,
        )

    raise ValueError("Workflow execution ended before reaching an output node.")
