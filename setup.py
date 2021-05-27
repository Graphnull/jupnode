from setuptools import setup, find_packages
# import subprocess
# import os
# from setuptools.command.build_py import build_py

def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()

setup(name='jupnode',
      version='0.5.7',
      description='Run nodejs in jupyter notebook',
      url='https://github.com/Graphnull/jupnode',
      install_requires=['ipython'],
      package_data={
        '': ['*.js','*.json']
      },
      author='Stepanov Vasiliy',
      author_email='',
      license='MIT',
      packages=find_packages(),
      include_package_data=False,
      zip_safe=False)
