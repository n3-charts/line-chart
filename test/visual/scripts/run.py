#!/usr/bin/env python

import sys
import os
import re
import shutil
import subprocess
import argparse
import json

# Images comparison
from PIL import Image, ImageChops
import math
import operator

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


def sanitize_test_cases():
  with cd('test_cases'):
    tests = os.listdir('.')

    errors = {}
    dirs = []

    for test in tests:
      if test == '.tmp':
        continue

      if sanitize_test_case(test):
        dirs.append(os.path.abspath(test))
      else:
        croak_and_slam_the_door("Invalid test case.")

    return dirs


def sanitize_test_case(test):
  if not has_desc(test):
    warn("[WARN] " + test + " does not contain 'desc' file.")

  if not has_expected_image(test):
    warn("[WARN] " + test + " does not contain 'expected.png' image.")

  missings = are_files_missing(os.path.abspath(test))
  if len(missings):
    error("Testcase '" + test + "' is missing the following files : " + ', '.join(missings))
    return False

  return True

def has_desc(path):
  return os.path.isfile(path + '/desc')


def has_expected_image(path):
  return os.path.isfile(path + '/expected.png')


def are_files_missing(path):
  mandatories = ['html', 'javascript']
  return filter(lambda m:not os.path.isfile(path + '/' + m), mandatories)


def create_temp_dir():
  target = ".tmp"

  if os.path.exists(target):
    info("Directory .tmp already exists, removing it")
    shutil.rmtree(target)

  os.mkdir(target)
  info("Creating .tmp directory")

  return target


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


def generate_test_files(dirs, project_path, template_path):
  info('Creating test files')
  with cd('.tmp'):
    for test in dirs:
      name = generate_test_file(test, project_path, template_path)
      debug("  created '" + name + "' test case")

  debug('...done')


def generate_test_file(test, project_path, template_path):
  name = os.path.basename(test)
  html = get_content(test + '/html')
  javascript = get_content(test + '/javascript')

  with open(name + ".html", 'w') as target:
    with open(template_path, 'r') as src:
      line = src.read()
      line = re.sub(r'%html%', html, line)
      line = re.sub(r'%javascript%', javascript, line)
      line = re.sub(r'%project_path%', project_path, line)

      target.write(line)
  return name


def capture_tests(project_path):
  with cd('.tmp'):
    files = os.listdir('.')


    info('Capturing images')

    for file in files:
      img = file.split('.')[0] + '.png'

      subprocess.call([
        project_path + 'node_modules/phantomjs/bin/phantomjs',
        '../scripts/capture.js',
        file,
        img
      ])

      debug('  captured ' + img)

    debug('...done')


def compare(dirs):
  images = {}

  with cd('.tmp'):
    files = os.listdir('.')

    for file in files:
      sp = file.split('.')
      if sp[1] == 'png':
        images[sp[0]] = {
          'computed': os.path.abspath(file)
        }
  errors = 0
  for name in images:
    o = images[name]

    with cd('test_cases/' + name):
      o['expected'] = os.path.abspath('expected.png')
      o['desc'] = get_first_line(os.path.abspath('desc'))


    if not os.path.isfile(o['expected']):
      o['comment'] = "No expected image"
      o['success'] = False
      errors += 1
    elif not os.path.isfile(o['computed']):
      o['comment'] = "No computed image"
      o['success'] = False
      errors += 1
    else:
      sc = histo_diff(o['expected'], o['computed'])
      o['score'] = sc
      if sc > 50:
        o['success'] = False
        errors += 1
      else:
        o['success'] = True

      o['comment'] = None
      pretty_print_result(o, name)

  return images, errors


def read_image (source):
  return Image.open(source)


def histo_diff (expected, computed):
  h0 = read_image(expected).histogram()
  h1 = read_image(computed).histogram()

  return math.sqrt(reduce(operator.add, map(lambda a,b: (a-b)**2, h0, h1))/len(h0))


def pretty_print_result(result, name):
  if result['comment'] is not None:
    error('[FAIL] ' + name + ' : ' + result['desc'])
    error('       ' + result['comment'])
  else:
    if result['success']:
      success('[PASS] ' + name + ' : ' + result['desc'])
    else:
      error('[FAIL] ' + name + ' : ' + result['desc'])
      error('       diff too high : ' + str(result['score']))

def bootstrap():
    parser = argparse.ArgumentParser(prog='line-chart visual regression tool')

    parser.add_argument('-v', '--verbose', action="store_true")
    parser.add_argument('-o', '--only')
    parser.add_argument('-u', '--update', action="store_true")

    return parser


def copy_computed_to_tests(dirs):
  with cd('.tmp'):
    for test in dirs:
      name = os.path.basename(test)
      debug("Copying capture for " + name)
      shutil.copy(name + ".png", test + "/expected.png")

    info(str(len(dirs)) + " screenshots copied as references")

def prepare_for_git(results):
  os.mkdir('.tmp/ready_for_git')
  with cd('.tmp/ready_for_git'):

    data = {
      "build": {
        "number": os.getenv('TRAVIS_BUILD_NUMBER', None),
        "branch": os.getenv('TRAVIS_BRANCH', None),
        "is_a_pull_request": os.getenv('TRAVIS_PULL_REQUEST', None)
      },
      "results": []
    }

    for key in results:
      result = results[key]

      data['results'].append({
        "name": key,
        "comment": result["comment"],
        "description": result["desc"],
        "score": result["score"],
        "success": result["success"],
        "expected_image": key + '_expected.png',
        "computed_image": key + '_computed.png'
      })

      shutil.copy(result['expected'], key + '_expected.png')
      shutil.copy(result['computed'], key + '_computed.png')

    with open("test_results.json", "w") as f:
      f.write(json.dumps(data))


args = bootstrap().parse_args()
verbose = args.verbose

scriptsDir = os.path.abspath(os.path.dirname(__file__))
visual = os.path.normpath(scriptsDir + '/../')

with cd(visual):
  project_path = "../../../"

  dirs = sanitize_test_cases()

  if args.only:
    dirs = filter(lambda d: os.path.basename(d) == args.only, dirs)

  create_temp_dir()
  generate_test_files(dirs, project_path, os.path.abspath("scripts/template.html"))
  capture_tests(project_path)

  if args.update:
    copy_computed_to_tests(dirs)
  else:
    results, errors = compare(dirs)
    prepare_for_git(results)

    if errors > 0:
      croak_and_slam_the_door(str(errors) + " failure(s)")
    else:
      sys.exit(0)
