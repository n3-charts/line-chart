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


class bcolors:
  OKGREEN = '\033[92m'
  OKBLUE = '\033[94m'
  FAIL = '\033[91m'
  WARNING = '\033[93m'
  ENDC = '\033[0m'

  def disable(self):
    self.OKGREEN = ''
    self.OKBLUE = ''
    self.WARNING = ''
    self.FAIL = ''
    self.ENDC = ''


def success(message):
  print bcolors.OKGREEN + message + bcolors.ENDC

def info(message):
  print "[INFO] " + message

def error(message):
  print bcolors.FAIL + message + bcolors.ENDC

def debug(message):
  if verbose:
    print message

def warn(message):
  print bcolors.WARNING + message + bcolors.ENDC


def croak_and_slam_the_door(message):
  error(message)
  error("Exiting with status 1 (no hard feelings).")
  sys.exit(1)


def get_first_line(path):
  if os.path.isfile(path):
    with open(path, "r") as source:
      return source.readline().rstrip()
  else:
    return ""


def get_content(path):
  content = ""
  with open(path, "r") as source:
    content = source.read()

  return content


def gather_examples(tests_dir):
  examples = []

  with cd(tests_dir):
    for test in os.listdir('.'):
      example = {}
      example['name'] = os.path.basename(test)
      example['datasets'] = get_content(test + '/datasets')
      example['options'] = get_content(test + '/options')
      examples.append(example)

  return examples

def bootstrap():
    parser = argparse.ArgumentParser(prog='line-chart visual regression tool')
    parser.add_argument('-v', '--verbose', action="store_true")
    return parser



args = bootstrap().parse_args()
verbose = args.verbose


current_dir = os.path.abspath(os.path.dirname(__file__))
tests_dir = os.path.normpath(current_dir + '/test_cases/')
project_dir = '/../../'

info('Creating global test file')
examples = gather_examples(tests_dir)

with cd(current_dir):
  with open("../index.html", 'w') as target:
    with open("index.html.tmpl", 'r') as template:
      line = template.read()
      line = re.sub(r'%project_path%', project_dir + '/', line)

      m = re.search(r'%repeat%(.*)%repeat%', line)
      values = []
      for example in examples:
        gp = m.group(1)
        gp = re.sub(r'%datasets%', example['datasets'], gp)
        gp = re.sub(r'%options%', example['options'], gp)
        gp = re.sub(r'%name%', example['name'], gp)

        values.append(gp)

      line = re.sub(r'%repeat%(.*)%repeat%', ',\n'.join(values), line)
      target.write(line)

  info('...done')
