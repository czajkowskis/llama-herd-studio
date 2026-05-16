from typing import Any


class WorkflowGraphValidationError(ValueError):
    pass


def collect_workflow_graph_errors(graph: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    nodes = graph.get("nodes")
    edges = graph.get("edges")

    if not isinstance(nodes, list):
        errors.append("Workflow graph must contain a nodes list.")

    if not isinstance(edges, list):
        errors.append("Workflow graph must contain an edges list.")

    if not isinstance(nodes, list) or not isinstance(edges, list):
        return errors

    if len(nodes) == 0:
        errors.append("Workflow graph must contain at least one node.")

    node_ids: set[str] = set()
    has_input_node = False
    has_output_node = False

    for index, node in enumerate(nodes):
        if not isinstance(node, dict):
            errors.append(f"Node at index {index} must be an object.")
            continue

        node_id = node.get("id")
        if not isinstance(node_id, str) or not node_id:
            errors.append(
                f"Node at index {index} must have a non-empty string id."
            )
            continue

        if node_id in node_ids:
            errors.append(f"Duplicate node id `{node_id}`.")
            continue

        node_ids.add(node_id)

        node_type = node.get("type")

        if node_type == "input":
            has_input_node = True

        if node_type == "output":
            has_output_node = True

        if node_type == "agent":
            data = node.get("data", {})
            if not isinstance(data, dict):
                errors.append(f"Agent node `{node_id}` must have an object data field.")
                continue

            agent_id = data.get("agent_id")
            if not isinstance(agent_id, str) or not agent_id:
                errors.append(f"Agent node `{node_id}` must define data.agent_id.")

    for index, edge in enumerate(edges):
        if not isinstance(edge, dict):
            errors.append(f"Edge at index {index} must be an object.")
            continue

        source = edge.get("source")
        target = edge.get("target")

        if not isinstance(source, str) or not source:
            errors.append(
                f"Edge at index {index} must have a non-empty string source."
            )

        if not isinstance(target, str) or not target:
            errors.append(
                f"Edge at index {index} must have a non-empty string target."
            )

        if isinstance(source, str) and source and source not in node_ids:
            errors.append(
                f"Edge at index {index} references unknown source node `{source}`."
            )

        if isinstance(target, str) and target and target not in node_ids:
            errors.append(
                f"Edge at index {index} references unknown target node `{target}`."
            )

    if not has_input_node:
        errors.append("Workflow graph must contain at least one input node.")

    if not has_output_node:
        errors.append("Workflow graph must contain at least one output node.")

    return errors


def validate_workflow_graph(graph: dict[str, Any]) -> None:
    errors = collect_workflow_graph_errors(graph)

    if errors:
        raise WorkflowGraphValidationError(errors[0])
