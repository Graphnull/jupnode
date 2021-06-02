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

@register_cell_magic
def py(line, cell):
    return cell

def shutdown_hook(ipython):
    nodeapp.terminate()
    raise TryNext

ip = get_ipython()


def modify_for_node_for_new_version(lines):
    if lines[0].strip() == '%%py':
        lines.pop(0)
    else:
        lines.insert(0, '%%node\n')
    return lines

class NodeInputTransformer():
    def __init__(self):
        self.lines=[]
        self.lineNumber=0
        self.isPython=False
    def push(self, line):
        if self.lineNumber==0 and line.strip()[0:28]=='get_ipython().run_cell_magic':
            self.isPython=True
            if line.strip()[0:40]=="get_ipython().run_cell_magic('py', '', '":
                return '\n'.join(line.strip()[40:-2].split('\\n'))
            return line
        
        if self.isPython ==True:
            return line
        if self.lineNumber==0:
            self.lines.append(line)
        else:
            self.lines.append(line)
        self.lineNumber+=1

        return ''
    
    def reset(self):
        if self.lineNumber!=0:
          self.lineNumber=0
          nodeapp.write('\n'.join(self.lines))
        self.lines=[]
        self.lineNumber=0
        self.isPython=False
        pass

if hasattr(ip, 'input_transformers_cleanup'):
    ip.input_transformers_cleanup.append(modify_for_node_for_new_version)
else:
    ip.input_transformer_manager.logical_line_transforms.insert(0, NodeInputTransformer())

