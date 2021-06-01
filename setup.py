from setuptools import setup, find_packages
import json
import os


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
        install_requires=[],
        package_data={
          '': ['*.js','*.json']
        },
        author=pkg_info['author'],
        author_email=pkg_info['email'],
        license=pkg_info['license'],
        packages=['jupnode'],
        include_package_data=True)
