#!/usr/bin/env python

import sys
import os
import re
import shutil
import subprocess
import argparse
import json

class cd:
  """Context manager for changing the current working directory"""
  def __init__(self, newPath):
    self.newPath = newPath

  def __enter__(self):
    self.savedPath = os.getcwd()
    os.chdir(self.newPath)

  def __exit__(self, etype, value, traceback):
    os.chdir(self.savedPath)

def bootstrap():
    parser = argparse.ArgumentParser()
    parser.add_argument('-n', '--name')

    return parser

args = bootstrap().parse_args()
name = args.name

if not name:
  print "Please specify a name like this : ./create_test_case.py -n my_name"
  sys.exit(1)

current_dir = os.path.abspath(os.path.dirname(__file__))
tests_dir = os.path.normpath(current_dir + '/../test_cases/')

target_dir = tests_dir + '/' + name

with cd(current_dir):
  shutil.copytree('case_template', target_dir)

lines = []
with cd(target_dir):
  with open('spec.js') as infile:
    for line in infile:
      lines.append(line.replace('%name%', name))

  with open('spec.js', 'w') as outfile:
    for line in lines:
      outfile.write(line)
