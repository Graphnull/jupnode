from IPython.core.magic import register_cell_magic
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


def modify_for_node(lines):
    if lines[0].strip() == '%%py':
        lines.pop(0)
    else:
        lines.insert(0, '(async()=>{\n')
        lines.insert(0, '%%node\n')
        lines.append('})()')
    return lines

ip = get_ipython()
ip.input_transformers_cleanup.append(modify_for_node)
