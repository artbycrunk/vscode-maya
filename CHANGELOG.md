# Changelog

## Version 1.5.0 (October 30, 2021)
* Enhancement: Add support for Maya 2022 with Python 3.7. (@artbycrunk in [issues/25](https://github.com/artbycrunk/vscode-maya/issues/25))

## Version 1.4.0 (May 01, 2020)
* Enhancement: ctrl+shift+o go to symbol support. (@artbycrunk in [issues/11](https://github.com/artbycrunk/vscode-maya/issues/11))
* Enhancement: Outline support for functions and variables (@artbycrunk in [issues/11](https://github.com/artbycrunk/vscode-maya/issues/12))

## Version 1.3.0 (April 27, 2020)
* Fix: Output line numbers are off by 1 (@artbycrunk in [issues/14](https://github.com/artbycrunk/vscode-maya/issues/14))
* Enhancement: Added telemetry for basic events

## Version 1.2.0 (Dec 21, 2019)
* Add Help on hover, with link to read the documentation online.
* Changed settings title to MayaCode to be in line with api docs
* Added better error msg when cannot connect to maya via commandPort.

## Version 1.1.0 (Aug 18, 2019)
* Add autocomplete for MEL variables. [issues/9](https://github.com/artbycrunk/vscode-maya/issues/9)
* Speedup autocomplete processing.

## Version 1.0.1 (Jul 06, 2019)
* Fixed issue with non-ascii characters in python code [issues/5](https://github.com/artbycrunk/vscode-maya/issues/5)

## Version 1.0.0 (May 15, 2019)
* Rewrite the code to work over a single Maya socket.
* Use temp files to send code between vscode and maya.
* Add support for sending complete files to maya
  thanks @Ziriax or the pull request. [pull/1](https://github.com/artbycrunk/vscode-maya/pull/1)

## Version 0.0.7
* Fix lookup regex for faster autocompletion.

## Version 0.0.6
* Updated Readme with gifs for demo.

## Version 0.0.5
* Bugfix for completions not found.

## Version 0.0.4
* Added support for autocompletion of MEL commands

## Version 0.0.3
* Added status bar indication when maya port is connected.
* Added context option, to select code and right-click, ```Send to Maya```

## Version 0.0.2
* Added commands ```Send to Maya``` via command port.
* Added Snippets for MEL code
* Added support for MEL grammar (Functions, comments, etc)
* Added support MEL language (auto closing pairs, brackets, surrounding pairs)
