from setuptools import setup, find_packages
import json
import os
from glob import glob


# with open(os.path.dirname(os.path.abspath(__file__))+'/package.json') as f:
#   pkg_info = json.load(f)
  
pkg_info={
  'name': 'jupnode',
  'version':'',
  'description':'',
  'homepage':'',
  'author':'',
  'email':'',
  'license':'',
}
setup(name=pkg_info['name'],
        version=pkg_info['version'],
        description=pkg_info['description'],
        url=pkg_info['homepage'],
        install_requires=['wheel'],
        setup_requires=['wheel'],
        package_data={
          '': ['*.js','*.json']
        },
        author=pkg_info['author'],
        author_email=pkg_info['email'],
        license=pkg_info['license'],
        packages=['jupnode', 'src'],
        package_dir={
        'jupnode': 'src',
    },
        include_package_data=False)
