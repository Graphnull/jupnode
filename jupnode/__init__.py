from IPython.core.magic import register_cell_magic
from IPython.core.inputtransformer import StatelessInputTransformer
from IPython.display import display, HTML
from IPython.core.error import TryNext
import warnings
from .node import Node
import os
import subprocess

nodeapp = Node()

@register_cell_magic
def node(line, cell):
    return nodeapp.write(cell)

def shutdown_hook(ipython):
    nodeapp.terminate()
    raise TryNext

ip = get_ipython()

@StatelessInputTransformer.wrap
def modify_for_node(cell):
    lines = cell.partition('\n')
    if lines[0].strip() == '%%py':
        lines.pop(0)
    else:
        lines.insert(0, '(async()=>{\n')
        lines.insert(0, '%%node\n')
        lines.append('})()')
    return "\n".join(lines)

def modify_for_node_for_new_version(lines):
    if lines[0].strip() == '%%py':
        lines.pop(0)
    else:
        lines.insert(0, '(async()=>{\n')
        lines.insert(0, '%%node\n')
        lines.append('})()')
    return lines

if hasattr(ip, 'input_transformers_cleanup'):
    ip.input_transformers_cleanup.append(modify_for_node_for_new_version)
else:
    ip.input_transformer_manager.logical_line_transforms.append(modify_for_node())

