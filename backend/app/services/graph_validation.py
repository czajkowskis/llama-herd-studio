from typing import Any


class WorkflowGraphValidationError(ValueError):
    pass


def validate_workflow_graph(graph: dict[str, Any]) -> None:
    nodes = graph.get("nodes")
    edges = graph.get("edges")

    if not isinstance(nodes, list):
        raise WorkflowGraphValidationError("Workflow graph must contain a nodes list.")

    if not isinstance(edges, list):
        raise WorkflowGraphValidationError("Workflow graph must contain an edges list.")

    if len(nodes) == 0:
        raise WorkflowGraphValidationError("Workflow graph must contain at least one node.")

    node_ids: set[str] = set()

    for index, node in enumerate(nodes):
        if not isinstance(node, dict):
            raise WorkflowGraphValidationError(f"Node at index {index} must be an object.")

        node_id = node.get("id")
        if not isinstance(node_id, str) or not node_id:
            raise WorkflowGraphValidationError(
                f"Node at index {index} must have a non-empty string id."
            )

        if node_id in node_ids:
            raise WorkflowGraphValidationError(f"Duplicate node id `{node_id}`.")

        node_ids.add(node_id)

    for index, edge in enumerate(edges):
        if not isinstance(edge, dict):
            raise WorkflowGraphValidationError(f"Edge at index {index} must be an object.")

        source = edge.get("source")
        target = edge.get("target")

        if not isinstance(source, str) or not source:
            raise WorkflowGraphValidationError(
                f"Edge at index {index} must have a non-empty string source."
            )

        if not isinstance(target, str) or not target:
            raise WorkflowGraphValidationError(
                f"Edge at index {index} must have a non-empty string target."
            )

        if source not in node_ids:
            raise WorkflowGraphValidationError(
                f"Edge at index {index} references unknown source node `{source}`."
            )

        if target not in node_ids:
            raise WorkflowGraphValidationError(
                f"Edge at index {index} references unknown target node `{target}`."
            )
